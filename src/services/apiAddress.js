import os from 'os'

export const getApiAddress = () => {
  const nets = os.networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.internal === false) {
        results[name] = results[name] || [];
        results[name].push(net.address);
      }
    }
  }

  return results['Wi-Fi'][3]
}