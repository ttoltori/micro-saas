import type { Language } from "./types";

export type TranslationKey =
  | "nav.compare"
  | "nav.quiz"
  | "nav.leaderboard"
  | "footer.tagline"
  | "footer.dataSource"
  | "home.title"
  | "home.subtitle"
  | "home.compareButton"
  | "home.quizButton"
  | "home.dailyCompare"
  | "home.trending"
  | "home.views"
  | "home.feature1Title"
  | "home.feature1Desc"
  | "home.feature2Title"
  | "home.feature2Desc"
  | "home.feature3Title"
  | "home.feature3Desc"
  | "compare.title"
  | "compare.searchPlaceholder"
  | "compare.loading"
  | "compare.left"
  | "compare.right"
  | "compare.selectCountry"
  | "compare.viewResult"
  | "compare.backToSelect"
  | "compare.changeCountry"
  | "compare.countrySelect"
  | "compare.searchCountry"
  | "compare.close"
  | "compare.vs"
  | "compare.score"
  | "compare.wins"
  | "compare.draws"
  | "compare.win"
  | "compare.draw"
  | "compare.dataNone"
  | "compare.source"
  | "compare.leftWins"
  | "compare.rightWins"
  | "quiz.title"
  | "quiz.dailyQuiz"
  | "quiz.dailyQuizDesc"
  | "quiz.start"
  | "quiz.starting"
  | "quiz.startError"
  | "quiz.feature1Title"
  | "quiz.feature1Desc"
  | "quiz.feature2Title"
  | "quiz.feature2Desc"
  | "quiz.feature3Title"
  | "quiz.feature3Desc"
  | "quiz.progress"
  | "quiz.exit"
  | "quiz.submitting"
  | "quiz.resultTitle"
  | "quiz.score"
  | "quiz.correct"
  | "quiz.duration"
  | "quiz.explanation"
  | "quiz.question"
  | "quiz.selected"
  | "quiz.answer"
  | "quiz.retry"
  | "quiz.viewLeaderboard"
  | "quiz.expectedRank"
  | "quiz.participants"
  | "quiz.registerPrompt"
  | "quiz.nickname"
  | "quiz.nicknamePlaceholder"
  | "quiz.nationality"
  | "quiz.selectCountry"
  | "quiz.register"
  | "quiz.registering"
  | "quiz.registered"
  | "quiz.notEligible"
  | "leaderboard.title"
  | "leaderboard.totalParticipants"
  | "leaderboard.empty"
  | "leaderboard.emptyDesc"
  | "leaderboard.takeQuiz"
  | "leaderboard.rank"
  | "leaderboard.nickname"
  | "leaderboard.nationality"
  | "leaderboard.score"
  | "leaderboard.correct"
  | "leaderboard.duration"
  | "common.loading";

type Translations = Record<TranslationKey, string>;

const ko: Translations = {
  "nav.compare": "비교",
  "nav.quiz": "퀴즈",
  "nav.leaderboard": "리더보드",
  "footer.tagline": "World VS — 공개 데이터 기반 국가 비교 서비스",
  "footer.dataSource": "데이터 출처: World Bank, UN, Global Firepower, UNESCO 등",
  "home.title": "World VS",
  "home.subtitle": "세계 국가를 한눈에 비교하고, 퀴즈로 학습하세요",
  "home.compareButton": "국가 비교하기",
  "home.quizButton": "퀴즈 풀기",
  "home.dailyCompare": "📅 오늘의 비교",
  "home.trending": "🔥 인기 비교",
  "home.views": "조회 {count}회",
  "home.feature1Title": "20개 지표 비교",
  "home.feature1Desc": "인구, 경제, 군사, 문화, 환경 등 다양한 분야",
  "home.feature2Title": "일일 퀴즈",
  "home.feature2Desc": "10문항으로 세계 지식 테스트",
  "home.feature3Title": "리더보드",
  "home.feature3Desc": "상위 100명과 순위 경쟁",
  "compare.title": "국가 비교",
  "compare.searchPlaceholder": "국가 검색...",
  "compare.loading": "불러오는 중...",
  "compare.left": "좌측",
  "compare.right": "우측",
  "compare.selectCountry": "선택하세요",
  "compare.viewResult": "비교 결과 보기 →",
  "compare.backToSelect": "← 국가 선택으로",
  "compare.changeCountry": "나라 변경",
  "compare.countrySelect": "국가 선택",
  "compare.searchCountry": "국가 검색...",
  "compare.close": "닫기",
  "compare.vs": "VS",
  "compare.score": "승",
  "compare.wins": "승",
  "compare.draws": "무",
  "compare.win": "승",
  "compare.draw": "무승부",
  "compare.dataNone": "데이터 없음",
  "compare.source": "출처",
  "compare.leftWins": "{country} 승",
  "compare.rightWins": "{country} 승",
  "quiz.title": "퀴즈",
  "quiz.dailyQuiz": "일일 퀴즈",
  "quiz.dailyQuizDesc": "10문항으로 세계 지식을 테스트하세요",
  "quiz.start": "퀴즈 시작하기",
  "quiz.starting": "시작 중...",
  "quiz.startError": "퀴즈를 시작할 수 없습니다. 잠시 후 다시 시도해주세요.",
  "quiz.feature1Title": "10문항",
  "quiz.feature1Desc": "OX 및 객관식",
  "quiz.feature2Title": "시간 측정",
  "quiz.feature2Desc": "빠를수록 유리",
  "quiz.feature3Title": "리더보드",
  "quiz.feature3Desc": "상위 100명 등록",
  "quiz.progress": "{current} / {total}",
  "quiz.exit": "나가기",
  "quiz.submitting": "제출 중...",
  "quiz.resultTitle": "결과",
  "quiz.score": "점수",
  "quiz.correct": "정답",
  "quiz.duration": "소요 시간",
  "quiz.explanation": "해설",
  "quiz.question": "문제 {number}",
  "quiz.selected": "선택",
  "quiz.answer": "정답",
  "quiz.retry": "다시 풀기",
  "quiz.viewLeaderboard": "리더보드 보기",
  "quiz.expectedRank": "예상 순위",
  "quiz.participants": "총 {count}명 참여",
  "quiz.registerPrompt": "🏆 100위 안에 들었습니다! 리더보드에 등록하세요.",
  "quiz.nickname": "닉네임 (2~20자)",
  "quiz.nicknamePlaceholder": "닉네임 입력",
  "quiz.nationality": "국적",
  "quiz.selectCountry": "국가 선택",
  "quiz.register": "리더보드에 등록하기",
  "quiz.registering": "등록 중...",
  "quiz.registered": "✅ 등록 완료! 리더보드로 이동합니다...",
  "quiz.notEligible": "100위 안에 들면 리더보드에 등록할 수 있습니다.",
  "leaderboard.title": "🏆 리더보드",
  "leaderboard.totalParticipants": "총 {count}명 참여",
  "leaderboard.empty": "아직 등록된 점수가 없습니다.",
  "leaderboard.emptyDesc": "퀴즈를 풀고 첫 번째 참여자가 되어보세요!",
  "leaderboard.takeQuiz": "퀴즈 풀기",
  "leaderboard.rank": "순위",
  "leaderboard.nickname": "닉네임",
  "leaderboard.nationality": "국적",
  "leaderboard.score": "점수",
  "leaderboard.correct": "정답",
  "leaderboard.duration": "시간",
  "common.loading": "불러오는 중...",
};

const ja: Translations = {
  "nav.compare": "比較",
  "nav.quiz": "クイズ",
  "nav.leaderboard": "リーダーボード",
  "footer.tagline": "World VS — 公開データベースの国比較サービス",
  "footer.dataSource": "データ出典: World Bank, UN, Global Firepower, UNESCO など",
  "home.title": "World VS",
  "home.subtitle": "世界の国々を一目で比較し、クイズで学ぼう",
  "home.compareButton": "国を比較する",
  "home.quizButton": "クイズを解く",
  "home.dailyCompare": "📅 今日の比較",
  "home.trending": "🔥 人気の比較",
  "home.views": "閲覧 {count}回",
  "home.feature1Title": "20指標比較",
  "home.feature1Desc": "人口、経済、軍事、文化、環境など多様な分野",
  "home.feature2Title": "デイリークイズ",
  "home.feature2Desc": "10問で世界知識テスト",
  "home.feature3Title": "リーダーボード",
  "home.feature3Desc": "上位100名と順位競争",
  "compare.title": "国比較",
  "compare.searchPlaceholder": "国を検索...",
  "compare.loading": "読み込み中...",
  "compare.left": "左側",
  "compare.right": "右側",
  "compare.selectCountry": "選択してください",
  "compare.viewResult": "比較結果を見る →",
  "compare.backToSelect": "← 国選択へ",
  "compare.changeCountry": "国を変更",
  "compare.countrySelect": "国選択",
  "compare.searchCountry": "国を検索...",
  "compare.close": "閉じる",
  "compare.vs": "VS",
  "compare.score": "勝",
  "compare.wins": "勝",
  "compare.draws": "分",
  "compare.win": "勝",
  "compare.draw": "引き分け",
  "compare.dataNone": "データなし",
  "compare.source": "出典",
  "compare.leftWins": "{country} 勝",
  "compare.rightWins": "{country} 勝",
  "quiz.title": "クイズ",
  "quiz.dailyQuiz": "デイリークイズ",
  "quiz.dailyQuizDesc": "10問で世界知識をテストしよう",
  "quiz.start": "クイズを開始",
  "quiz.starting": "開始中...",
  "quiz.startError": "クイズを開始できません。しばらくしてから再試行してください。",
  "quiz.feature1Title": "10問",
  "quiz.feature1Desc": "OXと選択式",
  "quiz.feature2Title": "時間測定",
  "quiz.feature2Desc": "早いほど有利",
  "quiz.feature3Title": "リーダーボード",
  "quiz.feature3Desc": "上位100名登録",
  "quiz.progress": "{current} / {total}",
  "quiz.exit": "退出",
  "quiz.submitting": "送信中...",
  "quiz.resultTitle": "結果",
  "quiz.score": "スコア",
  "quiz.correct": "正解",
  "quiz.duration": "所要時間",
  "quiz.explanation": "解説",
  "quiz.question": "問題 {number}",
  "quiz.selected": "選択",
  "quiz.answer": "正解",
  "quiz.retry": "もう一度",
  "quiz.viewLeaderboard": "リーダーボードを見る",
  "quiz.expectedRank": "予想順位",
  "quiz.participants": "参加者 {count}名",
  "quiz.registerPrompt": "🏆 100位以内です！リーダーボードに登録してください。",
  "quiz.nickname": "ニックネーム (2~20文字)",
  "quiz.nicknamePlaceholder": "ニックネーム入力",
  "quiz.nationality": "国籍",
  "quiz.selectCountry": "国を選択",
  "quiz.register": "リーダーボードに登録",
  "quiz.registering": "登録中...",
  "quiz.registered": "✅ 登録完了！リーダーボードに移動します...",
  "quiz.notEligible": "100位以内に入るとリーダーボードに登録できます。",
  "leaderboard.title": "🏆 リーダーボード",
  "leaderboard.totalParticipants": "参加者 {count}名",
  "leaderboard.empty": "まだ登録されたスコアがありません。",
  "leaderboard.emptyDesc": "クイズを解いて最初の参加者になりましょう！",
  "leaderboard.takeQuiz": "クイズを解く",
  "leaderboard.rank": "順位",
  "leaderboard.nickname": "ニックネーム",
  "leaderboard.nationality": "国籍",
  "leaderboard.score": "スコア",
  "leaderboard.correct": "正解",
  "leaderboard.duration": "時間",
  "common.loading": "読み込み中...",
};

const zh: Translations = {
  "nav.compare": "比较",
  "nav.quiz": "测验",
  "nav.leaderboard": "排行榜",
  "footer.tagline": "World VS — 基于公开数据的国家比较服务",
  "footer.dataSource": "数据来源: World Bank, UN, Global Firepower, UNESCO 等",
  "home.title": "World VS",
  "home.subtitle": "一目了然比较世界各国，通过测验学习知识",
  "home.compareButton": "比较国家",
  "home.quizButton": "做测验",
  "home.dailyCompare": "📅 今日比较",
  "home.trending": "🔥 热门比较",
  "home.views": "浏览 {count}次",
  "home.feature1Title": "20项指标比较",
  "home.feature1Desc": "人口、经济、军事、文化、环境等多领域",
  "home.feature2Title": "每日测验",
  "home.feature2Desc": "10题测试世界知识",
  "home.feature3Title": "排行榜",
  "home.feature3Desc": "与前100名竞争排名",
  "compare.title": "国家比较",
  "compare.searchPlaceholder": "搜索国家...",
  "compare.loading": "加载中...",
  "compare.left": "左侧",
  "compare.right": "右侧",
  "compare.selectCountry": "请选择",
  "compare.viewResult": "查看比较结果 →",
  "compare.backToSelect": "← 返回选择国家",
  "compare.changeCountry": "更换国家",
  "compare.countrySelect": "选择国家",
  "compare.searchCountry": "搜索国家...",
  "compare.close": "关闭",
  "compare.vs": "VS",
  "compare.score": "胜",
  "compare.wins": "胜",
  "compare.draws": "平",
  "compare.win": "胜",
  "compare.draw": "平局",
  "compare.dataNone": "无数据",
  "compare.source": "来源",
  "compare.leftWins": "{country} 胜",
  "compare.rightWins": "{country} 胜",
  "quiz.title": "测验",
  "quiz.dailyQuiz": "每日测验",
  "quiz.dailyQuizDesc": "10题测试你的世界知识",
  "quiz.start": "开始测验",
  "quiz.starting": "开始中...",
  "quiz.startError": "无法开始测验，请稍后重试。",
  "quiz.feature1Title": "10道题",
  "quiz.feature1Desc": "判断题和选择题",
  "quiz.feature2Title": "计时",
  "quiz.feature2Desc": "越快越有利",
  "quiz.feature3Title": "排行榜",
  "quiz.feature3Desc": "前100名注册",
  "quiz.progress": "{current} / {total}",
  "quiz.exit": "退出",
  "quiz.submitting": "提交中...",
  "quiz.resultTitle": "结果",
  "quiz.score": "分数",
  "quiz.correct": "正确",
  "quiz.duration": "用时",
  "quiz.explanation": "解析",
  "quiz.question": "题目 {number}",
  "quiz.selected": "选择",
  "quiz.answer": "答案",
  "quiz.retry": "再做一次",
  "quiz.viewLeaderboard": "查看排行榜",
  "quiz.expectedRank": "预计排名",
  "quiz.participants": "共 {count}人参与",
  "quiz.registerPrompt": "🏆 进入前100名！请注册到排行榜。",
  "quiz.nickname": "昵称 (2~20字符)",
  "quiz.nicknamePlaceholder": "输入昵称",
  "quiz.nationality": "国籍",
  "quiz.selectCountry": "选择国家",
  "quiz.register": "注册到排行榜",
  "quiz.registering": "注册中...",
  "quiz.registered": "✅ 注册完成！正在跳转到排行榜...",
  "quiz.notEligible": "进入前100名即可注册排行榜。",
  "leaderboard.title": "🏆 排行榜",
  "leaderboard.totalParticipants": "共 {count}人参与",
  "leaderboard.empty": "尚无注册分数。",
  "leaderboard.emptyDesc": "做测验成为第一位参与者吧！",
  "leaderboard.takeQuiz": "做测验",
  "leaderboard.rank": "排名",
  "leaderboard.nickname": "昵称",
  "leaderboard.nationality": "国籍",
  "leaderboard.score": "分数",
  "leaderboard.correct": "正确",
  "leaderboard.duration": "时间",
  "common.loading": "加载中...",
};

const en: Translations = {
  "nav.compare": "Compare",
  "nav.quiz": "Quiz",
  "nav.leaderboard": "Leaderboard",
  "footer.tagline": "World VS — Public data-based country comparison service",
  "footer.dataSource": "Data sources: World Bank, UN, Global Firepower, UNESCO, etc.",
  "home.title": "World VS",
  "home.subtitle": "Compare countries at a glance and learn with quizzes",
  "home.compareButton": "Compare Countries",
  "home.quizButton": "Take Quiz",
  "home.dailyCompare": "📅 Today's Comparison",
  "home.trending": "🔥 Trending Comparisons",
  "home.views": "{count} views",
  "home.feature1Title": "20 Indicators",
  "home.feature1Desc": "Population, economy, military, culture, environment",
  "home.feature2Title": "Daily Quiz",
  "home.feature2Desc": "Test your world knowledge in 10 questions",
  "home.feature3Title": "Leaderboard",
  "home.feature3Desc": "Compete with top 100 players",
  "compare.title": "Country Comparison",
  "compare.searchPlaceholder": "Search countries...",
  "compare.loading": "Loading...",
  "compare.left": "Left",
  "compare.right": "Right",
  "compare.selectCountry": "Select",
  "compare.viewResult": "View Comparison →",
  "compare.backToSelect": "← Back to selection",
  "compare.changeCountry": "Change country",
  "compare.countrySelect": "Select Country",
  "compare.searchCountry": "Search countries...",
  "compare.close": "Close",
  "compare.vs": "VS",
  "compare.score": "wins",
  "compare.wins": "wins",
  "compare.draws": "draws",
  "compare.win": "win",
  "compare.draw": "draw",
  "compare.dataNone": "No data",
  "compare.source": "Source",
  "compare.leftWins": "{country} wins",
  "compare.rightWins": "{country} wins",
  "quiz.title": "Quiz",
  "quiz.dailyQuiz": "Daily Quiz",
  "quiz.dailyQuizDesc": "Test your world knowledge with 10 questions",
  "quiz.start": "Start Quiz",
  "quiz.starting": "Starting...",
  "quiz.startError": "Could not start the quiz. Please try again later.",
  "quiz.feature1Title": "10 Questions",
  "quiz.feature1Desc": "True/False and multiple choice",
  "quiz.feature2Title": "Timed",
  "quiz.feature2Desc": "Faster is better",
  "quiz.feature3Title": "Leaderboard",
  "quiz.feature3Desc": "Top 100 registration",
  "quiz.progress": "{current} / {total}",
  "quiz.exit": "Exit",
  "quiz.submitting": "Submitting...",
  "quiz.resultTitle": "Result",
  "quiz.score": "Score",
  "quiz.correct": "Correct",
  "quiz.duration": "Duration",
  "quiz.explanation": "Explanation",
  "quiz.question": "Question {number}",
  "quiz.selected": "Selected",
  "quiz.answer": "Answer",
  "quiz.retry": "Retry",
  "quiz.viewLeaderboard": "View Leaderboard",
  "quiz.expectedRank": "Expected Rank",
  "quiz.participants": "{count} participants",
  "quiz.registerPrompt": "🏆 You're in the top 100! Register to the leaderboard.",
  "quiz.nickname": "Nickname (2~20 chars)",
  "quiz.nicknamePlaceholder": "Enter nickname",
  "quiz.nationality": "Nationality",
  "quiz.selectCountry": "Select country",
  "quiz.register": "Register to Leaderboard",
  "quiz.registering": "Registering...",
  "quiz.registered": "✅ Registered! Redirecting to leaderboard...",
  "quiz.notEligible": "Rank in the top 100 to register on the leaderboard.",
  "leaderboard.title": "🏆 Leaderboard",
  "leaderboard.totalParticipants": "{count} participants",
  "leaderboard.empty": "No scores registered yet.",
  "leaderboard.emptyDesc": "Take a quiz and be the first participant!",
  "leaderboard.takeQuiz": "Take Quiz",
  "leaderboard.rank": "Rank",
  "leaderboard.nickname": "Nickname",
  "leaderboard.nationality": "Nationality",
  "leaderboard.score": "Score",
  "leaderboard.correct": "Correct",
  "leaderboard.duration": "Time",
  "common.loading": "Loading...",
};

export const translations: Record<Language, Translations> = { ko, ja, zh, en };

export type TranslateFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

export function createTranslate(lang: Language): TranslateFunction {
  const dict = translations[lang] ?? translations.en;
  return (key: TranslationKey, params?: Record<string, string | number>) => {
    let text = dict[key] ?? translations.en[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    return text;
  };
}
