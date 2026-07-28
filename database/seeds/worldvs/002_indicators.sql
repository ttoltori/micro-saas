-- World VS — Seed Data: Indicators (20)
INSERT INTO worldvs.indicators (id, category, name_ko, name_en, unit, description_ko, source_name, source_url, higher_is_better, display_type, decimal_places, is_mvp, sort_order) VALUES
('population_total', 'BASIC', '인구', 'Population', '명', '총 인구 수', 'World Bank', 'https://data.worldbank.org/indicator/SP.POP.TOTL', NULL, 'NUMBER', 0, true, 1),
('area_km2', 'BASIC', '면적', 'Area', 'km²', '국토 면적', 'World Bank', 'https://data.worldbank.org/indicator/AG.SRF.TOTL.K2', NULL, 'NUMBER', 0, true, 2),
('population_density', 'BASIC', '인구밀도', 'Population Density', '명/km²', '인구를 면적으로 나눈 값', 'Calculated', NULL, NULL, 'NUMBER', 1, true, 3),
('capital', 'BASIC', '수도', 'Capital', '', '수도', 'REST Countries', 'https://restcountries.com', NULL, 'TEXT', 0, true, 4),
('gdp_nominal', 'ECONOMY', '명목 GDP', 'Nominal GDP', '달러', '명목 국내총생산', 'World Bank', 'https://data.worldbank.org/indicator/NY.GDP.MKTP.CD', true, 'MONEY', 0, true, 5),
('gdp_per_capita', 'ECONOMY', '1인당 GDP', 'GDP per Capita', '달러', '1인당 국내총생산', 'World Bank', 'https://data.worldbank.org/indicator/NY.GDP.PCAP.CD', true, 'MONEY', 0, true, 6),
('exports_total', 'ECONOMY', '수출액', 'Total Exports', '달러', '총 수출액', 'World Bank', 'https://data.worldbank.org/indicator/TG.VAL.TOTL.GD.ZS', true, 'MONEY', 0, true, 7),
('internet_penetration', 'ECONOMY', '인터넷 사용률', 'Internet Penetration', '%', '인터넷 사용 인구 비율', 'World Bank', 'https://data.worldbank.org/indicator/IT.NET.USER.ZS', true, 'PERCENT', 1, true, 8),
('life_expectancy', 'SOCIETY', '기대수명', 'Life Expectancy', '세', '출생시 기대수명', 'World Bank', 'https://data.worldbank.org/indicator/SP.DYN.LE00.IN', true, 'NUMBER', 1, true, 9),
('fertility_rate', 'SOCIETY', '출산율', 'Fertility Rate', '명', '여성 1인당 출산율', 'World Bank', 'https://data.worldbank.org/indicator/SP.DYN.TFRT.IN', NULL, 'NUMBER', 2, true, 10),
('median_age', 'SOCIETY', '중위연령', 'Median Age', '세', '인구의 중위 연령', 'UN World Population Prospects', 'https://population.un.org/wpp/', NULL, 'NUMBER', 1, true, 11),
('urbanization_rate', 'SOCIETY', '도시화율', 'Urbanization Rate', '%', '도시 인구 비율', 'World Bank', 'https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS', NULL, 'PERCENT', 1, true, 12),
('defense_budget', 'MILITARY', '국방비', 'Defense Budget', '달러', '국방 예산 (공개 자료 기반 추정치)', 'Global Firepower', 'https://www.globalfirepower.com/defense-budgets.php', true, 'MONEY', 0, true, 13),
('fighter_aircraft', 'MILITARY', '전투기 수', 'Fighter Aircraft', '대', '보유 전투기 수 (공개 자료 기반 추정치)', 'Global Firepower', 'https://www.globalfirepower.com/', NULL, 'COUNT', 0, true, 14),
('tanks', 'MILITARY', '전차 수', 'Tanks', '대', '보유 전차 수 (공개 자료 기반 추정치)', 'Global Firepower', 'https://www.globalfirepower.com/', NULL, 'COUNT', 0, true, 15),
('naval_vessels', 'MILITARY', '해군 함정 수', 'Naval Vessels', '척', '보유 해군 함정 수 (공개 자료 기반 추정치)', 'Global Firepower', 'https://www.globalfirepower.com/', NULL, 'COUNT', 0, true, 16),
('unesco_sites', 'CULTURE', '유네스코 세계유산', 'UNESCO World Heritage Sites', '곳', '유네스코 세계유산 등록 수', 'UNESCO', 'https://whc.unesco.org/en/list/', true, 'COUNT', 0, true, 17),
('tourist_arrivals', 'CULTURE', '외국인 관광객', 'Tourist Arrivals', '명', '연간 외국인 관광객 수', 'World Bank', 'https://data.worldbank.org/indicator/ST.INT.ARVL', true, 'NUMBER', 0, true, 18),
('highest_peak', 'ENVIRONMENT', '최고봉', 'Highest Peak', 'm', '최고봉의 높이', 'Various', NULL, true, 'NUMBER', 0, true, 19),
('co2_emissions', 'ENVIRONMENT', 'CO₂ 배출량', 'CO₂ Emissions', '톤', '연간 이산화탄소 배출량', 'Our World in Data', 'https://ourworldindata.org/co2-emissions', false, 'NUMBER', 0, true, 20)
ON CONFLICT (id) DO NOTHING;
