// 로컬 알림만 쓰므로 expo-notifications가 넣는 aps-environment(푸시) 권한을 제거한다.
// 푸시 capability가 없는 프로비저닝 프로파일로도 빌드되게 하기 위함.
// 주의: mod는 등록 역순으로 실행되므로 app.json plugins에서 expo-notifications보다 앞에 둬야 한다.
const { withEntitlementsPlist } = require('expo/config-plugins');

module.exports = function withoutPushEntitlement(config) {
  return withEntitlementsPlist(config, (c) => {
    delete c.modResults['aps-environment'];
    return c;
  });
};
