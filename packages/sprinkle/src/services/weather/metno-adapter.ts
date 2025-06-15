import {
  WeatherAdapter,
  WeatherCondition,
  RainHistory,
  RainForecast,
} from './weather-adapter.interface';
import {
  MetNoEntity,
  MetWeatherHistoryRecord,
  HistoryResponse,
  ForecastEntry,
} from './metno-types';
import { getWeatherIcon } from '../../components/weather-display/weather-icons';

export class MetNoAdapter extends WeatherAdapter {
  private static readonly RAIN_CONDITIONS = ['rainy', 'pouring', 'snowy-rainy'];

  async getCurrentCondition(): Promise<WeatherCondition | null> {
    try {
      const entity = this.haService.getEntityState(
        this.entityId
      ) as unknown as MetNoEntity;
      if (!entity) return null;

      return {
        condition: entity.state,
        temperature: entity.attributes.temperature,
        humidity: entity.attributes.humidity,
        icon: this.getIconForCondition(entity.state),
      };
    } catch (error) {
      return this.handleError('getCurrentCondition', error);
    }
  }

  async getRainHistory(): Promise<RainHistory | null> {
    try {
      const now = new Date();
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

      const params = {
        type: 'history/history_during_period',
        start_time: twoDaysAgo.toISOString(),
        end_time: now.toISOString(),
        minimal_response: false,
        no_attributes: true,
        entity_ids: [this.entityId],
      };

      const response = await this.haService.callWS<HistoryResponse>(params);
      if (!response || !response[this.entityId]) return null;

      return this.calculateRainHistory(response[this.entityId], now);
    } catch (error) {
      return this.handleError('getRainHistory', error);
    }
  }

  async getRainForecast(): Promise<RainForecast | null> {
    try {
      const forecastResponse = await this.haService.callService(
        'weather',
        'get_forecasts',
        {
          type: 'hourly',
          entity_id: 'weather.forecast_home',
        },
        {},
        undefined,
        true
      );

      const entityForecast =
        forecastResponse?.response &&
        (forecastResponse.response[this.entityId] as {
          forecast: ForecastEntry[];
        });
      if (!entityForecast || !entityForecast) {
        console.warn('No forecast data received from weather service');
        return null;
      }

      const forecast = entityForecast.forecast;
      const next24h = this.filterNext24Hours(forecast);
      return this.calculateRainForecast(next24h);
    } catch (error) {
      return this.handleError('getRainForecast', error);
    }
  }

  private calculateRainHistory(
    records: MetWeatherHistoryRecord[],
    now: Date
  ): RainHistory {
    let totalRainMinutes = 0;
    let lastRainTime: Date | undefined;
    let isCurrentlyRaining = false;
    // Process records chronologically
    for (let i = 0; i < records.length; i++) {
      const current = records[i];
      const isRaining = this.isRainCondition(current.s);
      const timestamp = new Date(current.lu);

      if (isRaining) {
        if (!isCurrentlyRaining) {
          // Rain started
          isCurrentlyRaining = true;
        }

        // Calculate duration until next record or now
        const nextTimestamp =
          i < records.length - 1 ? new Date(records[i + 1].lu) : now;

        const durationMinutes =
          (nextTimestamp.getTime() - timestamp.getTime()) / (1000 * 60);
        totalRainMinutes += durationMinutes;
      } else if (isCurrentlyRaining) {
        // Rain just ended
        isCurrentlyRaining = false;
        lastRainTime = timestamp;
      }
    }

    // If it was raining in the last record, set lastRainTime to now
    if (isCurrentlyRaining) {
      lastRainTime = now;
    }

    return {
      totalRainHours: Math.round((totalRainMinutes / 60) * 10) / 10, // Round to 1 decimal
      lastRainTime,
      totalPrecipitation: 0, // Would need precipitation sensor for accurate mm
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private calculateRainForecast(forecast: any[]): RainForecast {
    const rainPeriods: RainForecast['rainPeriods'] = [];
    let totalExpectedMm = 0;
    let currentRainStart: Date | null = null;
    let currentRainMm = 0;

    for (let i = 0; i < forecast.length; i++) {
      const item = forecast[i];
      const itemTime = new Date(item.datetime);
      const hasRain = item.precipitation > 0;

      if (hasRain) {
        totalExpectedMm += item.precipitation;

        if (!currentRainStart) {
          // Start of a new rain period
          currentRainStart = itemTime;
          currentRainMm = item.precipitation;
        } else {
          // Continue accumulating rain
          currentRainMm += item.precipitation;
        }
      } else if (currentRainStart) {
        // End of rain period
        const nextItemTime =
          i < forecast.length - 1
            ? new Date(forecast[i].datetime)
            : new Date(currentRainStart.getTime() + 60 * 60 * 1000);

        rainPeriods.push({
          start: currentRainStart,
          end: nextItemTime,
          precipitationMm: currentRainMm,
        });

        currentRainStart = null;
        currentRainMm = 0;
      }
    }

    // Handle case where rain continues to end of forecast
    if (currentRainStart) {
      const lastItem = forecast[forecast.length - 1];
      const endTime = new Date(
        new Date(lastItem.datetime).getTime() + 60 * 60 * 1000
      );

      rainPeriods.push({
        start: currentRainStart,
        end: endTime,
        precipitationMm: currentRainMm,
      });
    }

    // Calculate total rain hours from periods
    const totalRainMinutes = rainPeriods.reduce((total, period) => {
      return (
        total + (period.end.getTime() - period.start.getTime()) / (1000 * 60)
      );
    }, 0);

    return {
      expectedRainHours: Math.round((totalRainMinutes / 60) * 10) / 10, // Round to 1 decimal
      totalExpectedMm: Math.round(totalExpectedMm * 10) / 10,
      rainPeriods,
    };
  }

  private isRainCondition(condition: string): boolean {
    return MetNoAdapter.RAIN_CONDITIONS.includes(condition);
  }

  private getIconForCondition(condition: string): string {
    return getWeatherIcon(condition);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private filterNext24Hours(forecast: any[]): any[] {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return forecast.filter((item) => {
      const itemTime = new Date(item.datetime);
      return itemTime >= now && itemTime <= next24h;
    });
  }
}
