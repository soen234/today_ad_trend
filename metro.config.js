const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// 웹에서 zustand가 ESM(.mjs) 빌드로 해석되면 import.meta 때문에 번들 전체가 SyntaxError로 깨진다.
// 웹에서는 zustand를 CommonJS 빌드 파일로 직접 연결한다 (네이티브는 원래 CJS를 쓴다).
const zustandDir = path.dirname(require.resolve('zustand/package.json'));
const defaultResolve = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && (moduleName === 'zustand' || moduleName.startsWith('zustand/'))) {
    const sub = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);
    return { type: 'sourceFile', filePath: path.join(zustandDir, `${sub}.js`) };
  }
  return (defaultResolve ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
