-- Ad Trend Viewer - Row Level Security Policies
-- schema.sql 실행 후 이 파일을 실행하세요

-- RLS 활성화
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_ads ENABLE ROW LEVEL SECURITY;

-- Categories: 모든 사용자 읽기 가능 (공개 데이터)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

-- Ads: 모든 사용자 읽기 가능 (공개 데이터)
CREATE POLICY "Ads are viewable by everyone"
  ON ads FOR SELECT
  USING (true);

-- Collections: 본인 컬렉션만 조회
CREATE POLICY "Users can view own collections"
  ON collections FOR SELECT
  USING (auth.uid() = user_id);

-- Collections: 공개 컬렉션은 모든 사용자가 조회 가능
CREATE POLICY "Public collections are viewable by everyone"
  ON collections FOR SELECT
  USING (is_public = true);

-- Collections: 본인 컬렉션만 생성
CREATE POLICY "Users can create own collections"
  ON collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Collections: 본인 컬렉션만 수정
CREATE POLICY "Users can update own collections"
  ON collections FOR UPDATE
  USING (auth.uid() = user_id);

-- Collections: 본인 컬렉션만 삭제
CREATE POLICY "Users can delete own collections"
  ON collections FOR DELETE
  USING (auth.uid() = user_id);

-- Saved Ads: 본인 저장 광고만 조회
CREATE POLICY "Users can view own saved ads"
  ON saved_ads FOR SELECT
  USING (auth.uid() = user_id);

-- Saved Ads: 본인만 광고 저장
CREATE POLICY "Users can save ads"
  ON saved_ads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Saved Ads: 본인 저장 광고만 수정
CREATE POLICY "Users can update own saved ads"
  ON saved_ads FOR UPDATE
  USING (auth.uid() = user_id);

-- Saved Ads: 본인 저장 광고만 삭제
CREATE POLICY "Users can delete own saved ads"
  ON saved_ads FOR DELETE
  USING (auth.uid() = user_id);
