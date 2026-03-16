/// <reference lib="webworker" />

self.onmessage = (e: MessageEvent) => {
  const { data, width, height, strength } = e.data as {
    data: Uint8ClampedArray;
    width: number;
    height: number;
    strength: number;
  };

  const output = new Uint8ClampedArray(data.length);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const rVals: number[] = [];
      const gVals: number[] = [];
      const bVals: number[] = [];

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            rVals.push(data[idx]);
            gVals.push(data[idx + 1]);
            bVals.push(data[idx + 2]);
          }
        }
      }

      const median = (arr: number[]) => {
        arr.sort((a, b) => a - b);
        return arr[Math.floor(arr.length / 2)];
      };

      output[i]     = data[i]     * (1 - strength) + median(rVals) * strength;
      output[i + 1] = data[i + 1] * (1 - strength) + median(gVals) * strength;
      output[i + 2] = data[i + 2] * (1 - strength) + median(bVals) * strength;
      output[i + 3] = data[i + 3]; // preserve alpha
    }
  }

  self.postMessage({ data: output }, [output.buffer]);
};
