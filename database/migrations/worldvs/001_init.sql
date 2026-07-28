-- World VS — Schema Migration
-- Run this on your Supabase PostgreSQL (or local PostgreSQL) database

CREATE SCHEMA IF NOT EXISTS worldvs;

-- 국가
CREATE TABLE IF NOT EXISTS worldvs.countries (
    code VARCHAR(2) PRIMARY KEY,
    iso3 VARCHAR(3) NOT NULL,
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_ja VARCHAR(100),
    flag_emoji VARCHAR(10),
    flag_image_url TEXT,
    capital_ko VARCHAR(100),
    capital_en VARCHAR(100),
    region VARCHAR(50) NOT NULL,
    subregion VARCHAR(50),
    latitude NUMERIC(10, 6),
    longitude NUMERIC(10, 6),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 지표
CREATE TABLE IF NOT EXISTS worldvs.indicators (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(20) NOT NULL,
    name_ko VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    description_ko TEXT,
    source_name VARCHAR(100) NOT NULL,
    source_url TEXT,
    higher_is_better BOOLEAN,
    display_type VARCHAR(20) NOT NULL,
    decimal_places INT NOT NULL DEFAULT 0,
    is_mvp BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 국가별 지표 값
CREATE TABLE IF NOT EXISTS worldvs.country_indicator_values (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(2) NOT NULL REFERENCES worldvs.countries(code),
    indicator_id VARCHAR(50) NOT NULL REFERENCES worldvs.indicators(id),
    value NUMERIC(20, 4),
    text_value TEXT,
    year INT,
    source_name VARCHAR(100) NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(country_code, indicator_id)
);

-- 퀴즈 문항
CREATE TABLE IF NOT EXISTS worldvs.quiz_questions (
    id VARCHAR(20) PRIMARY KEY,
    type VARCHAR(30) NOT NULL,
    difficulty VARCHAR(10) NOT NULL,
    category VARCHAR(20) NOT NULL,
    question_ko TEXT NOT NULL,
    question_en TEXT,
    question_ja TEXT,
    correct_option_id VARCHAR(10) NOT NULL,
    explanation_ko TEXT,
    explanation_en TEXT,
    explanation_ja TEXT,
    related_indicator_id VARCHAR(50) REFERENCES worldvs.indicators(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 퀴즈 보기
CREATE TABLE IF NOT EXISTS worldvs.quiz_options (
    id BIGSERIAL PRIMARY KEY,
    question_id VARCHAR(20) NOT NULL REFERENCES worldvs.quiz_questions(id),
    option_id VARCHAR(10) NOT NULL,
    text_ko VARCHAR(200) NOT NULL,
    text_en VARCHAR(200),
    text_ja VARCHAR(200),
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE(question_id, option_id)
);

-- 퀴즈 문항-국가 연결
CREATE TABLE IF NOT EXISTS worldvs.quiz_question_countries (
    question_id VARCHAR(20) NOT NULL REFERENCES worldvs.quiz_questions(id),
    country_code VARCHAR(2) NOT NULL REFERENCES worldvs.countries(code),
    sort_order INT NOT NULL DEFAULT 0,
    PRIMARY KEY(question_id, country_code)
);

-- 퀴즈 세션
CREATE TABLE IF NOT EXISTS worldvs.quiz_sessions (
    id VARCHAR(30) PRIMARY KEY,
    mode VARCHAR(30) NOT NULL,
    category VARCHAR(20),
    difficulty VARCHAR(10),
    question_count INT NOT NULL DEFAULT 10,
    device_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ
);

-- 퀴즈 세션 문항
CREATE TABLE IF NOT EXISTS worldvs.quiz_session_questions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(30) NOT NULL REFERENCES worldvs.quiz_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(30) NOT NULL REFERENCES worldvs.quiz_questions(id),
    sort_order INT NOT NULL DEFAULT 0,
    UNIQUE(session_id, question_id)
);

-- 퀴즈 결과
CREATE TABLE IF NOT EXISTS worldvs.quiz_results (
    id VARCHAR(30) PRIMARY KEY,
    session_id VARCHAR(30) NOT NULL REFERENCES worldvs.quiz_sessions(id),
    score INT NOT NULL,
    correct_count INT NOT NULL,
    total_questions INT NOT NULL,
    duration_seconds INT NOT NULL,
    title VARCHAR(50),
    title_emoji VARCHAR(10),
    device_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 퀴즈 정답 로그
CREATE TABLE IF NOT EXISTS worldvs.quiz_answer_logs (
    id BIGSERIAL PRIMARY KEY,
    result_id VARCHAR(30) NOT NULL REFERENCES worldvs.quiz_results(id),
    question_id VARCHAR(20) NOT NULL REFERENCES worldvs.quiz_questions(id),
    category VARCHAR(20),
    difficulty VARCHAR(10),
    selected_option_id VARCHAR(10),
    correct_option_id VARCHAR(10) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    duration_ms INT
);

-- 리더보드
CREATE TABLE IF NOT EXISTS worldvs.leaderboard (
    id BIGSERIAL PRIMARY KEY,
    quiz_result_id VARCHAR(30) REFERENCES worldvs.quiz_results(id),
    player_name VARCHAR(20) NOT NULL,
    nationality_code VARCHAR(2) NOT NULL REFERENCES worldvs.countries(code),
    score INT NOT NULL,
    correct_count INT NOT NULL,
    total_questions INT NOT NULL,
    duration_seconds INT NOT NULL,
    quiz_mode VARCHAR(30) NOT NULL,
    device_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 비교 조회 로그 (트렌딩 집계용)
CREATE TABLE IF NOT EXISTS worldvs.compare_views (
    id BIGSERIAL PRIMARY KEY,
    left_country_code VARCHAR(2) NOT NULL,
    right_country_code VARCHAR(2) NOT NULL,
    device_id_hash TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_civ_country ON worldvs.country_indicator_values(country_code);
CREATE INDEX IF NOT EXISTS idx_civ_indicator ON worldvs.country_indicator_values(indicator_id);
CREATE INDEX IF NOT EXISTS idx_indicators_category ON worldvs.indicators(category);
CREATE INDEX IF NOT EXISTS idx_indicators_mvp ON worldvs.indicators(is_mvp);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_type ON worldvs.quiz_questions(type);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_category ON worldvs.quiz_questions(category);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created ON worldvs.quiz_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_results_score ON worldvs.quiz_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON worldvs.leaderboard(score DESC, duration_seconds ASC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_compare_views_pair ON worldvs.compare_views(left_country_code, right_country_code);
