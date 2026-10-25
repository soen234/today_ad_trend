import { isSafeWebUrl } from '@/lib/open';

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(), WebBrowserPresentationStyle: {} }));

describe('isSafeWebUrl', () => {
  it('allows http and https', () => {
    expect(isSafeWebUrl('https://digiday.com/a?b=1')).toBe(true);
    expect(isSafeWebUrl('http://example.com')).toBe(true);
  });

  it('rejects script, data and app schemes', () => {
    expect(isSafeWebUrl('javascript:alert(1)')).toBe(false);
    expect(isSafeWebUrl('JaVaScRiPt:alert(1)')).toBe(false);
    expect(isSafeWebUrl('data:text/html,<script>1</script>')).toBe(false);
    expect(isSafeWebUrl('tel:+15555555555')).toBe(false);
    expect(isSafeWebUrl('someapp://open')).toBe(false);
  });

  it('rejects garbage', () => {
    expect(isSafeWebUrl('')).toBe(false);
    expect(isSafeWebUrl('not a url')).toBe(false);
  });
});
