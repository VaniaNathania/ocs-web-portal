// eslint-disable-next-line no-unused-vars
export const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: any;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};

export const jsonToQueryParams = (json: any) => {
  const params = new URLSearchParams();

  for (const key in json) {
    if (json.hasOwnProperty(key)) {
      params.append(key, json[key]);
    }
  }

  return params.toString();
};


export const ApplicationFileDownloadUrl = (API_URL: any, token: any, fileName: any) => {
  return `${API_URL}/application/file/download?name=${fileName}&token=${token}`;
}

export const getFileExtension = (filename: string): string | null => {
  const lastDotIndex = filename.lastIndexOf('.');
  if (lastDotIndex === -1 || lastDotIndex === 0 || lastDotIndex === filename.length - 1) {
    return null; // No extension found or invalid format
  }
  return filename.substring(lastDotIndex + 1);
}