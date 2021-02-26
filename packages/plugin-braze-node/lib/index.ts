/* eslint-disable no-unused-vars, class-methods-use-this, no-constant-condition, no-await-in-loop */
import fetch from 'node-fetch';
import {
  Event, Properties, RequestLoggerPlugin, PluginLoadOptions,
} from '@itly/sdk';

export type BrazeOptions = {
  baseUrl: string;
}

/**
 * Braze Node Plugin for Iteratively SDK
 */
export class BrazePlugin extends RequestLoggerPlugin {
  private readonly userTrackUrl: string;

  constructor(
    private readonly apiKey: string,
    private readonly options: BrazeOptions,
  ) {
    super('braze');
    const baseUrl = options.baseUrl.replace(/\/$/, '');
    this.userTrackUrl = `${baseUrl}/users/track`;
  }

  load(options: PluginLoadOptions) {
    super.load(options);
  }

  async identify(userId: string, properties?: Properties) {
    const responseLogger = this.logger!.logRequest('identify', `${userId}, ${JSON.stringify(properties)}`);

    const eventProperties = properties != null
      ? Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, BrazePlugin.valueForAPI(value)]))
      : properties;

    try {
      const response = await fetch(this.userTrackUrl, {
        method: 'post',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attributes: [
            {
              ...eventProperties,
              external_id: userId,
            },
          ],
        }),
      });
      if (response.status < 300) {
        responseLogger.success('success');
      } else {
        responseLogger.success(`unexpected status code: ${response.status}`);
      }
    } catch (e) {
      responseLogger.error(e.toString());
    }
  }

  async track(userId: string, { name, properties }: Event) {
    const responseLogger = this.logger!.logRequest('identify', `${userId}, ${name}, ${JSON.stringify(properties)}`);

    const eventProperties = properties != null
      ? Object.fromEntries(Object.entries(properties).map(([key, value]) => [key, BrazePlugin.valueForAPI(value)]))
      : properties;

    try {
      const response = await fetch(this.userTrackUrl, {
        method: 'post',
        headers: {
          authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: [
            {
              ...eventProperties,
              name,
              external_id: userId,
              time: new Date().toISOString(),
              _update_existing_only: true,
            },
          ],
        }),
      });
      if (response.status < 300) {
        responseLogger.success('success');
      } else {
        responseLogger.success(`unexpected status code: ${response.status}`);
      }
    } catch (e) {
      responseLogger.error(e.toString());
    }
  }

  private static valueForAPI(value: any): any {
    // https://www.braze.com/docs/api/objects_filters/user_attributes_object/
    // https://www.braze.com/docs/api/objects_filters/event_object/
    // API supports doesn't support objects and (non-string) arrays.
    return (value != null && typeof value === 'object') ? JSON.stringify(value) : value;
  }
}
