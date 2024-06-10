/**
 * helper type that that loads json-content
 */
export class JsonLoader {
  private readonly url;
  private authorization: string = '';
  private parameters: string[] = [];
  private readonly method: METHOD;

  constructor(url: string, method: METHOD) {
    this.url = url;
    this.method = method;
  }

  withParameter(name: string, value: string): JsonLoader {
    this.parameters.push(`${name}=${value}`);
    return this;
  }

  withBasicAuthorization(user: string, pass: string): JsonLoader {
    this.authorization = `Basic ${btoa(`${user}:${pass}`)}`;
    return this;
  }

  /**
   * load from the given url and return a promise resolving to an instance of LfvEvent
   * @param url
   */
  async load<T>(): Promise<T> {
    const authorization = this.authorization;
    const method = this.method;
    let url = this.url;

    const querystring = this.parameters.join('&');

    // in case of GET append querystring
    if (method === 'GET') {
      url += `?${querystring}`;
    }

    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url);
      if (authorization !== '') {
        xhr.setRequestHeader('Authorization', authorization);
      }
      if (method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      }
      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(this.statusText));
        }
      };
      xhr.onerror = (e) => {
        reject(e);
      };
      if (method === 'GET') {
        xhr.send();
      } else {
        xhr.send(querystring);
      }
    });
  }
}

export type METHOD = 'GET' | 'POST';
