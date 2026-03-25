export interface Dong {
  id: string;
  nameKr: string;
  lastWinRound: number;
  winPoints?: number;
}

export interface SubRegion {
  id: string;
  name: string;
  nameKr: string;
  lastWinRound: number;
  winPoints?: number;
  dongs?: Dong[];
}

export interface RegionData {
  id: string;
  name: string;
  nameKr: string;
  lastWinRound: number;
  winPoints?: number;
  subRegions?: SubRegion[];
}

export const KOREAN_REGIONS: RegionData[] = [
  { 
    id: "seoul", 
    name: "Seoul", 
    nameKr: "서울", 
    lastWinRound: 1150,
    winPoints: 245,
    subRegions: [
      { 
        id: "gangnam", name: "Gangnam-gu", nameKr: "강남구", lastWinRound: 1152, winPoints: 32,
        dongs: [
          { id: "yeoksam", nameKr: "역삼동", lastWinRound: 1153, winPoints: 8 },
          { id: "samseong", nameKr: "삼성동", lastWinRound: 1145, winPoints: 5 },
          { id: "daechi", nameKr: "대치동", lastWinRound: 1140, winPoints: 6 },
          { id: "apgujeong", nameKr: "압구정동", lastWinRound: 1130, winPoints: 4 },
        ]
      },
      { 
        id: "seocho", name: "Seocho-gu", nameKr: "서초구", lastWinRound: 1148, winPoints: 24,
        dongs: [
          { id: "seocho-dong", nameKr: "서초동", lastWinRound: 1148, winPoints: 7 },
          { id: "banpo", nameKr: "반포동", lastWinRound: 1140, winPoints: 6 },
          { id: "bangbae", nameKr: "방배동", lastWinRound: 1135, winPoints: 4 },
          { id: "yangjae", nameKr: "양재동", lastWinRound: 1128, winPoints: 3 },
        ]
      },
      { 
        id: "songpa", name: "Songpa-gu", nameKr: "송파구", lastWinRound: 1150, winPoints: 28,
        dongs: [
          { id: "jamshil", nameKr: "잠실동", lastWinRound: 1150, winPoints: 7 },
          { id: "munjeong", nameKr: "문정동", lastWinRound: 1142, winPoints: 5 },
          { id: "gaerong", nameKr: "가락동", lastWinRound: 1138, winPoints: 4 },
          { id: "bang-i", nameKr: "방이동", lastWinRound: 1132, winPoints: 3 },
        ]
      },
      { 
        id: "mapo", name: "Mapo-gu", nameKr: "마포구", lastWinRound: 1145,
        dongs: [
          { id: "gongdeok", nameKr: "공덕동", lastWinRound: 1145 },
          { id: "sangam", nameKr: "상암동", lastWinRound: 1138 },
          { id: "seogyo", nameKr: "서교동", lastWinRound: 1130 },
        ]
      },
      { id: "yongsan", name: "Yongsan-gu", nameKr: "용산구", lastWinRound: 1140,
        dongs: [
          { id: "hannam", nameKr: "한남동", lastWinRound: 1140 },
          { id: "ichon", nameKr: "이촌동", lastWinRound: 1132 },
        ]
      },
      { id: "gangdong", name: "Gangdong-gu", nameKr: "강동구", lastWinRound: 1142 },
      { id: "gangbuk", name: "Gangbuk-gu", nameKr: "강북구", lastWinRound: 1147 },
      { id: "gangseo", name: "Gangseo-gu", nameKr: "강서구", lastWinRound: 1149 },
      { id: "gwanak", name: "Gwanak-gu", nameKr: "관악구", lastWinRound: 1151 },
      { id: "gwangjin", name: "Gwangjin-gu", nameKr: "광진구", lastWinRound: 1144 },
      { id: "guro", name: "Guro-gu", nameKr: "구로구", lastWinRound: 1141 },
      { id: "geumcheon", name: "Geumcheon-gu", nameKr: "금천구", lastWinRound: 1138 },
      { id: "nowon", name: "Nowon-gu", nameKr: "노원구", lastWinRound: 1135 },
      { id: "dobong", name: "Dobong-gu", nameKr: "도봉구", lastWinRound: 1132 },
      { id: "dongdaemun", name: "Dongdaemun-gu", nameKr: "동대문구", lastWinRound: 1128 },
      { id: "dongjak", name: "Dongjak-gu", nameKr: "동작구", lastWinRound: 1125 },
      { id: "seodaemun", name: "Seodaemun-gu", nameKr: "서대문구", lastWinRound: 1122 },
      { id: "seongdong", name: "Seongdong-gu", nameKr: "성동구", lastWinRound: 1118 },
      { id: "seongbuk", name: "Seongbuk-gu", nameKr: "성북구", lastWinRound: 1115 },
      { id: "yangcheon", name: "Yangcheon-gu", nameKr: "양천구", lastWinRound: 1112 },
      { id: "yeongdeungpo", name: "Yeongdeungpo-gu", nameKr: "영등포구", lastWinRound: 1108 },
      { id: "jung", name: "Jung-gu", nameKr: "중구", lastWinRound: 1105 },
      { id: "jungnang", name: "Jungnang-gu", nameKr: "중랑구", lastWinRound: 1102 },
      { id: "jongno", name: "Jongno-gu", nameKr: "종로구", lastWinRound: 1098 },
      { id: "eunpyeong", name: "Eunpyeong-gu", nameKr: "은평구", lastWinRound: 1095 },
    ]
  },
  { 
    id: "gyeonggi", 
    name: "Gyeonggi", 
    nameKr: "경기", 
    lastWinRound: 1153,
    winPoints: 312,
    subRegions: [
      { 
        id: "suwon", name: "Suwon-si", nameKr: "수원시", lastWinRound: 1153, winPoints: 42,
        dongs: [
          { id: "ingye", nameKr: "인계동", lastWinRound: 1153, winPoints: 9 },
          { id: "maetan", nameKr: "매탄동", lastWinRound: 1145, winPoints: 6 },
          { id: "gwanggyo", nameKr: "광교동", lastWinRound: 1138, winPoints: 5 },
        ]
      },
      { id: "seongnam", name: "Seongnam-si", nameKr: "성남시", lastWinRound: 1151, winPoints: 35,
        dongs: [
          { id: "pangyo", nameKr: "판교동", lastWinRound: 1151, winPoints: 8 },
          { id: "bundang", nameKr: "분당동", lastWinRound: 1142, winPoints: 12 },
        ]
      },
      { id: "goyang", name: "Goyang-si", nameKr: "고양시", lastWinRound: 1149, winPoints: 28,
        dongs: [
          { id: "ilsan", nameKr: "일산동", lastWinRound: 1149, winPoints: 8 },
          { id: "hwajeong", nameKr: "화정동", lastWinRound: 1142, winPoints: 6 },
          { id: "juyeop", nameKr: "주엽동", lastWinRound: 1135, winPoints: 7 },
          { id: "madu", nameKr: "마두동", lastWinRound: 1128, winPoints: 7 },
        ]
      },
      { id: "yongin", name: "Yongin-si", nameKr: "용인시", lastWinRound: 1147, winPoints: 38,
        dongs: [
          { id: "suji", nameKr: "수지구", lastWinRound: 1147, winPoints: 15 },
          { id: "giheung", nameKr: "기흥구", lastWinRound: 1140, winPoints: 13 },
          { id: "cheoin", nameKr: "처인구", lastWinRound: 1132, winPoints: 10 },
        ]
      },
      { id: "bucheon", name: "Bucheon-si", nameKr: "부천시", lastWinRound: 1145, winPoints: 22,
        dongs: [
          { id: "sang-dong", nameKr: "상동", lastWinRound: 1145, winPoints: 8 },
          { id: "jung-dong-b", nameKr: "중동", lastWinRound: 1138, winPoints: 7 },
          { id: "sosabon", nameKr: "소사본동", lastWinRound: 1130, winPoints: 7 },
        ]
      },
      { id: "ansan", name: "Ansan-si", nameKr: "안산시", lastWinRound: 1143, winPoints: 18,
        dongs: [
          { id: "gojan", nameKr: "고잔동", lastWinRound: 1143, winPoints: 7 },
          { id: "seonbu", nameKr: "선부동", lastWinRound: 1135, winPoints: 6 },
          { id: "sa-dong", nameKr: "사동", lastWinRound: 1128, winPoints: 5 },
        ]
      },
      { id: "anyang", name: "Anyang-si", nameKr: "안양시", lastWinRound: 1141, winPoints: 15,
        dongs: [
          { id: "beomgye", nameKr: "범계동", lastWinRound: 1141, winPoints: 6 },
          { id: "pyeongchon", nameKr: "평촌동", lastWinRound: 1132, winPoints: 5 },
          { id: "anyang-dong", nameKr: "안양동", lastWinRound: 1125, winPoints: 4 },
        ]
      },
      { id: "namyangju", name: "Namyangju-si", nameKr: "남양주시", lastWinRound: 1138, winPoints: 14,
        dongs: [
          { id: "dasandong", nameKr: "다산동", lastWinRound: 1138, winPoints: 5 },
          { id: "byeollae", nameKr: "별내동", lastWinRound: 1130, winPoints: 5 },
          { id: "wabu", nameKr: "와부읍", lastWinRound: 1122, winPoints: 4 },
        ]
      },
      { id: "hwaseong", name: "Hwaseong-si", nameKr: "화성시", lastWinRound: 1135, winPoints: 25,
        dongs: [
          { id: "dongtan", nameKr: "동탄동", lastWinRound: 1135, winPoints: 12 },
          { id: "hyangnam", nameKr: "향남읍", lastWinRound: 1128, winPoints: 7 },
          { id: "bongdam", nameKr: "봉담읍", lastWinRound: 1120, winPoints: 6 },
        ]
      },
    ]
  },
  { id: "busan", name: "Busan", nameKr: "부산", lastWinRound: 1145, winPoints: 124,
    subRegions: [
      { id: "haeundae", name: "Haeundae-gu", nameKr: "해운대구", lastWinRound: 1145, winPoints: 18,
        dongs: [
          { id: "udong", nameKr: "우동", lastWinRound: 1145, winPoints: 5 },
          { id: "jungdong", nameKr: "중동", lastWinRound: 1138, winPoints: 4 },
          { id: "jwadong", nameKr: "좌동", lastWinRound: 1130, winPoints: 3 },
        ]
      },
      { id: "busanjin", name: "Busanjin-gu", nameKr: "부산진구", lastWinRound: 1140, winPoints: 12,
        dongs: [
          { id: "bujeon", nameKr: "부전동", lastWinRound: 1140, winPoints: 5 },
          { id: "yangjeong", nameKr: "양정동", lastWinRound: 1132, winPoints: 4 },
          { id: "gaegeum", nameKr: "개금동", lastWinRound: 1125, winPoints: 3 },
        ]
      },
    ]
  },
  { id: "daegu", name: "Daegu", nameKr: "대구", lastWinRound: 1148, winPoints: 86,
    subRegions: [
      { id: "suseong", name: "Suseong-gu", nameKr: "수성구", lastWinRound: 1148, winPoints: 15,
        dongs: [
          { id: "beomeo", nameKr: "범어동", lastWinRound: 1148, winPoints: 4 },
          { id: "manchon", nameKr: "만촌동", lastWinRound: 1140, winPoints: 3 },
        ]
      },
    ]
  },
  { id: "incheon", name: "Incheon", nameKr: "인천", lastWinRound: 1152, winPoints: 92,
    subRegions: [
      { id: "yeonsu", name: "Yeonsu-gu", nameKr: "연수구", lastWinRound: 1152, winPoints: 14,
        dongs: [
          { id: "songdo", nameKr: "송도동", lastWinRound: 1152, winPoints: 4 },
          { id: "yeonsu-dong", nameKr: "연수동", lastWinRound: 1145, winPoints: 3 },
        ]
      },
    ]
  },
  { id: "gwangju", name: "Gwangju", nameKr: "광주", lastWinRound: 1150, winPoints: 58,
    subRegions: [
      { id: "bukgu", name: "Buk-gu", nameKr: "북구", lastWinRound: 1150, winPoints: 12,
        dongs: [
          { id: "yongbong", nameKr: "용봉동", lastWinRound: 1150, winPoints: 3 },
          { id: "unnam", nameKr: "운암동", lastWinRound: 1142, winPoints: 2 },
        ]
      },
    ]
  },
  { id: "daejeon", name: "Daejeon", nameKr: "대전", lastWinRound: 1152, winPoints: 64,
    subRegions: [
      { id: "yuseong", name: "Yuseong-gu", nameKr: "유성구", lastWinRound: 1152, winPoints: 14,
        dongs: [
          { id: "gung", nameKr: "궁동", lastWinRound: 1152, winPoints: 3 },
          { id: "bongmyeong", nameKr: "봉명동", lastWinRound: 1145, winPoints: 4 },
        ]
      },
    ]
  },
  { id: "ulsan", name: "Ulsan", nameKr: "울산", lastWinRound: 1157, winPoints: 42,
    subRegions: [
      { id: "namgu", name: "Nam-gu", nameKr: "남구", lastWinRound: 1157, winPoints: 10,
        dongs: [
          { id: "samsan", nameKr: "삼산동", lastWinRound: 1157, winPoints: 3 },
          { id: "dal-dong", nameKr: "달동", lastWinRound: 1148, winPoints: 2 },
        ]
      },
    ]
  },
  { id: "sejong", name: "Sejong", nameKr: "세종", lastWinRound: 1140, winPoints: 12,
    subRegions: [
      { id: "sejong-si", name: "Sejong-si", nameKr: "세종시", lastWinRound: 1140, winPoints: 12,
        dongs: [
          { id: "boram", nameKr: "보람동", lastWinRound: 1140, winPoints: 3 },
          { id: "dodam", nameKr: "도담동", lastWinRound: 1135, winPoints: 2 },
        ]
      }
    ]
  },
  { id: "gangwon", name: "Gangwon", nameKr: "강원", lastWinRound: 1154, winPoints: 28,
    subRegions: [
      { id: "chuncheon", name: "Chuncheon-si", nameKr: "춘천시", lastWinRound: 1154, winPoints: 6,
        dongs: [
          { id: "hyoja", nameKr: "효자동", lastWinRound: 1154, winPoints: 2 },
          { id: "toegye", nameKr: "퇴계동", lastWinRound: 1145, winPoints: 2 },
        ]
      },
      { id: "wonju", name: "Wonju-si", nameKr: "원주시", lastWinRound: 1150, winPoints: 8,
        dongs: [
          { id: "dangu", nameKr: "단구동", lastWinRound: 1150, winPoints: 3 },
          { id: "musil", nameKr: "무실동", lastWinRound: 1142, winPoints: 2 },
        ]
      },
      { id: "gangneung", name: "Gangneung-si", nameKr: "강릉시", lastWinRound: 1145, winPoints: 5,
        dongs: [
          { id: "gyodong", nameKr: "교동", lastWinRound: 1145, winPoints: 3 },
          { id: "ponam", nameKr: "포남동", lastWinRound: 1135, winPoints: 2 },
        ]
      },
      { id: "sokcho", name: "Sokcho-si", nameKr: "속초시", lastWinRound: 1138, winPoints: 3,
        dongs: [
          { id: "joyang", nameKr: "조양동", lastWinRound: 1138, winPoints: 2 },
          { id: "dongmyeong", nameKr: "동명동", lastWinRound: 1125, winPoints: 1 },
        ]
      },
      { id: "donghae", name: "Donghae-si", nameKr: "동해시", lastWinRound: 1132, winPoints: 2,
        dongs: [
          { id: "cheon-gok", nameKr: "천곡동", lastWinRound: 1132, winPoints: 2 },
        ]
      },
    ]
  },
  { id: "chungbuk", name: "Chungbuk", nameKr: "충북", lastWinRound: 1151, winPoints: 32,
    subRegions: [
      { id: "cheongju", name: "Cheongju-si", nameKr: "청주시", lastWinRound: 1151, winPoints: 15,
        dongs: [
          { id: "gachul", nameKr: "가경동", lastWinRound: 1151, winPoints: 4 },
          { id: "bokdae", nameKr: "복대동", lastWinRound: 1145, winPoints: 3 },
        ]
      },
      { id: "chungju", name: "Chungju-si", nameKr: "충주시", lastWinRound: 1148, winPoints: 6,
        dongs: [
          { id: "yeonsu-chungju", nameKr: "연수동", lastWinRound: 1148, winPoints: 3 },
          { id: "chilgeum", nameKr: "칠금동", lastWinRound: 1138, winPoints: 3 },
        ]
      },
      { id: "jecheon", name: "Jecheon-si", nameKr: "제천시", lastWinRound: 1140, winPoints: 4,
        dongs: [
          { id: "uirim", nameKr: "의림동", lastWinRound: 1140, winPoints: 4 },
        ]
      },
      { id: "eumseong", name: "Eumseong-gun", nameKr: "음성군", lastWinRound: 1135, winPoints: 3,
        dongs: [
          { id: "geumwang", nameKr: "금왕읍", lastWinRound: 1135, winPoints: 3 },
        ]
      },
    ]
  },
  { id: "chungnam", name: "Chungnam", nameKr: "충남", lastWinRound: 1156, winPoints: 45,
    subRegions: [
      { id: "cheonan", name: "Cheonan-si", nameKr: "천안시", lastWinRound: 1156, winPoints: 12,
        dongs: [
          { id: "dujeong", nameKr: "두정동", lastWinRound: 1156, winPoints: 4 },
          { id: "buldang", nameKr: "불당동", lastWinRound: 1148, winPoints: 3 },
          { id: "sinbang", nameKr: "신방동", lastWinRound: 1142, winPoints: 2 },
        ]
      },
      { id: "asan", name: "Asan-si", nameKr: "아산시", lastWinRound: 1152, winPoints: 8,
        dongs: [
          { id: "oncheon", nameKr: "온천동", lastWinRound: 1152, winPoints: 3 },
          { id: "baebang", nameKr: "배방읍", lastWinRound: 1145, winPoints: 2 },
          { id: "tangjeong", nameKr: "탕정면", lastWinRound: 1138, winPoints: 1 },
        ]
      },
      { id: "gongju", name: "Gongju-si", nameKr: "공주시", lastWinRound: 1148, winPoints: 4,
        dongs: [
          { id: "sin-gwan", nameKr: "신관동", lastWinRound: 1148, winPoints: 2 },
          { id: "ok-ryong", nameKr: "옥룡동", lastWinRound: 1135, winPoints: 1 },
        ]
      },
      { id: "boryeong", name: "Boryeong-si", nameKr: "보령시", lastWinRound: 1145, winPoints: 3 },
      { id: "seosan", name: "Seosan-si", nameKr: "서산시", lastWinRound: 1151, winPoints: 5,
        dongs: [
          { id: "dongmun", nameKr: "동문동", lastWinRound: 1151, winPoints: 2 },
          { id: "seoknam", nameKr: "석남동", lastWinRound: 1142, winPoints: 1 },
        ]
      },
      { id: "nonsan", name: "Nonsan-si", nameKr: "논산시", lastWinRound: 1142, winPoints: 4 },
      { id: "dangjin", name: "Dangjin-si", nameKr: "당진시", lastWinRound: 1154, winPoints: 6,
        dongs: [
          { id: "dangjin-dong", nameKr: "당진동", lastWinRound: 1154, winPoints: 3 },
          { id: "songak", nameKr: "송악읍", lastWinRound: 1145, winPoints: 2 },
        ]
      },
      { id: "gyeryong", name: "Gyeryong-si", nameKr: "계룡시", lastWinRound: 1140, winPoints: 2 },
      { id: "geumsan", name: "Geumsan-gun", nameKr: "금산군", lastWinRound: 1135, winPoints: 2 },
      { id: "buyeo", name: "Buyeo-gun", nameKr: "부여군", lastWinRound: 1132, winPoints: 2 },
      { id: "seocheon", name: "Seocheon-gun", nameKr: "서천군", lastWinRound: 1128, winPoints: 2 },
      { id: "cheongyang", name: "Cheongyang-gun", nameKr: "청양군", lastWinRound: 1125, winPoints: 1 },
      { id: "yesan", name: "Yesan-gun", nameKr: "예산군", lastWinRound: 1142, winPoints: 3 },
      { id: "taean", name: "Taean-gun", nameKr: "태안군", lastWinRound: 1148, winPoints: 3 },
      { id: "hongseong", name: "Hongseong-gun", nameKr: "홍성군", lastWinRound: 1138, winPoints: 3 },
    ]
  },
  { id: "jeonbuk", name: "Jeonbuk", nameKr: "전북", lastWinRound: 1148,
    subRegions: [
      { id: "jeonju", name: "Jeonju-si", nameKr: "전주시", lastWinRound: 1148, winPoints: 12,
        dongs: [
          { id: "hyoja-dong", nameKr: "효자동", lastWinRound: 1148, winPoints: 4 },
          { id: "seosin", nameKr: "서신동", lastWinRound: 1142, winPoints: 3 },
        ]
      },
      { id: "iksan", name: "Iksan-si", nameKr: "익산시", lastWinRound: 1145, winPoints: 8,
        dongs: [
          { id: "yeongdeung", nameKr: "영등동", lastWinRound: 1145, winPoints: 3 },
          { id: "mo현", nameKr: "모현동", lastWinRound: 1138, winPoints: 2 },
        ]
      },
      { id: "gunsan", name: "Gunsan-si", nameKr: "군산시", lastWinRound: 1151, winPoints: 7,
        dongs: [
          { id: "naun", nameKr: "나운동", lastWinRound: 1151, winPoints: 3 },
          { id: "susong", nameKr: "수송동", lastWinRound: 1142, winPoints: 2 },
        ]
      },
      { id: "jeongeup", name: "Jeongeup-si", nameKr: "정읍시", lastWinRound: 1138, winPoints: 3,
        dongs: [
          { id: "sigi", nameKr: "시기동", lastWinRound: 1138, winPoints: 3 },
        ]
      },
      { id: "gimje", name: "Gimje-si", nameKr: "김제시", lastWinRound: 1132, winPoints: 2,
        dongs: [
          { id: "yochon", nameKr: "요촌동", lastWinRound: 1132, winPoints: 2 },
        ]
      },
      { id: "namwon", name: "Namwon-si", nameKr: "남원시", lastWinRound: 1140, winPoints: 4,
        dongs: [
          { id: "do-tong", nameKr: "도통동", lastWinRound: 1140 },
          { id: "hyang-gyo", nameKr: "향교동", lastWinRound: 1132 },
        ]
      },
      { id: "wanju", name: "Wanju-gun", nameKr: "완주군", lastWinRound: 1142, winPoints: 3,
        dongs: [
          { id: "bongdong", nameKr: "봉동읍", lastWinRound: 1142, winPoints: 3 },
        ]
      },
      { id: "jinan", name: "Jinan-gun", nameKr: "진안군", lastWinRound: 1125, winPoints: 1 },
      { id: "muju", name: "Muju-gun", nameKr: "무주군", lastWinRound: 1122, winPoints: 1 },
      { id: "jangsu", name: "Jangsu-gun", nameKr: "장수군", lastWinRound: 1120, winPoints: 1 },
      { id: "imsil", name: "Imsil-gun", nameKr: "임실군", lastWinRound: 1124, winPoints: 1 },
      { id: "sunchang", name: "Sunchang-gun", nameKr: "순창군", lastWinRound: 1126, winPoints: 1 },
      { id: "gochang", name: "Gochang-gun", nameKr: "고창군", lastWinRound: 1130, winPoints: 2 },
      { id: "buan", name: "Buan-gun", nameKr: "부안군", lastWinRound: 1135, winPoints: 3,
        dongs: [
          { id: "buan-eup", nameKr: "부안읍", lastWinRound: 1135 },
          { id: "byeonsan", nameKr: "변산면", lastWinRound: 1128 },
        ]
      },
    ]
  },
  { id: "jeonnam", name: "Jeonnam", nameKr: "전남", lastWinRound: 1145, winPoints: 38,
    subRegions: [
      { id: "mokpo", name: "Mokpo-si", nameKr: "목포시", lastWinRound: 1145, winPoints: 7,
        dongs: [
          { id: "sangdong", nameKr: "상동", lastWinRound: 1145, winPoints: 4 },
          { id: "yongdang", nameKr: "용당동", lastWinRound: 1135, winPoints: 3 },
        ]
      },
      { id: "yeosu", name: "Yeosu-si", nameKr: "여수시", lastWinRound: 1142, winPoints: 8,
        dongs: [
          { id: "hakdong", nameKr: "학동", lastWinRound: 1142, winPoints: 5 },
          { id: "yeoseo", nameKr: "여서동", lastWinRound: 1130, winPoints: 3 },
        ]
      },
      { id: "suncheon", name: "Suncheon-si", nameKr: "순천시", lastWinRound: 1140, winPoints: 9,
        dongs: [
          { id: "yeonhyang", nameKr: "연향동", lastWinRound: 1140, winPoints: 5 },
          { id: "josurye", nameKr: "조례동", lastWinRound: 1132, winPoints: 4 },
        ]
      },
      { id: "gwangyang", name: "Gwangyang-si", nameKr: "광양시", lastWinRound: 1135, winPoints: 5,
        dongs: [
          { id: "jungmadong", nameKr: "중마동", lastWinRound: 1135, winPoints: 5 },
        ]
      },
      { id: "naju", name: "Naju-si", nameKr: "나주시", lastWinRound: 1130, winPoints: 4,
        dongs: [
          { id: "bitgaram", nameKr: "빛가람동", lastWinRound: 1130, winPoints: 4 },
        ]
      },
    ]
  },
  { id: "gyeongbuk", name: "Gyeongbuk", nameKr: "경북", lastWinRound: 1153, winPoints: 52,
    subRegions: [
      { id: "pohang", name: "Pohang-si", nameKr: "포항시", lastWinRound: 1153, winPoints: 14,
        dongs: [
          { id: "duho", nameKr: "두호동", lastWinRound: 1153, winPoints: 5 },
          { id: "jukdo", nameKr: "죽도동", lastWinRound: 1145, winPoints: 5 },
          { id: "idong", nameKr: "이동", lastWinRound: 1138, winPoints: 4 },
        ]
      },
      { id: "gyeongju", name: "Gyeongju-si", nameKr: "경주시", lastWinRound: 1150, winPoints: 8,
        dongs: [
          { id: "hwangseong", nameKr: "황성동", lastWinRound: 1150, winPoints: 5 },
          { id: "dongcheon", nameKr: "동천동", lastWinRound: 1138, winPoints: 3 },
        ]
      },
      { id: "gumi", name: "Gumi-si", nameKr: "구미시", lastWinRound: 1148, winPoints: 10,
        dongs: [
          { id: "hyeong-gok", nameKr: "형곡동", lastWinRound: 1148, winPoints: 6 },
          { id: "indong", nameKr: "인동", lastWinRound: 1135, winPoints: 4 },
        ]
      },
      { id: "gyeongsan", name: "Gyeongsan-si", nameKr: "경산시", lastWinRound: 1142, winPoints: 6,
        dongs: [
          { id: "gyeongsan-dong", nameKr: "경산동", lastWinRound: 1142, winPoints: 6 },
        ]
      },
      { id: "andong", name: "Andong-si", nameKr: "안동시", lastWinRound: 1135, winPoints: 5,
        dongs: [
          { id: "okdong", nameKr: "옥동", lastWinRound: 1135, winPoints: 5 },
        ]
      },
    ]
  },
  { id: "gyeongnam", name: "Gyeongnam", nameKr: "경남", lastWinRound: 1159, winPoints: 65,
    subRegions: [
      { id: "changwon", name: "Changwon-si", nameKr: "창원시", lastWinRound: 1159, winPoints: 22,
        dongs: [
          { id: "sangnam", nameKr: "상남동", lastWinRound: 1159, winPoints: 8 },
          { id: "jungang", nameKr: "중앙동", lastWinRound: 1150, winPoints: 7 },
          { id: "naeseo", nameKr: "내서읍", lastWinRound: 1142, winPoints: 7 },
        ]
      },
      { id: "gimhae", name: "Gimhae-si", nameKr: "김해시", lastWinRound: 1155, winPoints: 12,
        dongs: [
          { id: "naewoe", nameKr: "내외동", lastWinRound: 1155, winPoints: 7 },
          { id: "bukbu", nameKr: "북부동", lastWinRound: 1145, winPoints: 5 },
        ]
      },
      { id: "jinju", name: "Jinju-si", nameKr: "진주시", lastWinRound: 1152, winPoints: 8,
        dongs: [
          { id: "chojeon", nameKr: "초전동", lastWinRound: 1152, winPoints: 5 },
          { id: "pajeong", nameKr: "판문동", lastWinRound: 1140, winPoints: 3 },
        ]
      },
      { id: "yangsan", name: "Yangsan-si", nameKr: "양산시", lastWinRound: 1148, winPoints: 7,
        dongs: [
          { id: "mulgeum", nameKr: "물금읍", lastWinRound: 1148, winPoints: 7 },
        ]
      },
      { id: "geoje", name: "Geoje-si", nameKr: "거제시", lastWinRound: 1145, winPoints: 6,
        dongs: [
          { id: "gohyeon", nameKr: "고현동", lastWinRound: 1145, winPoints: 6 },
        ]
      },
    ]
  },
  { id: "jeju", name: "Jeju", nameKr: "제주", lastWinRound: 1130, winPoints: 15,
    subRegions: [
      { id: "jeju-si", name: "Jeju-si", nameKr: "제주시", lastWinRound: 1130, winPoints: 10 },
      { id: "seogwipo", name: "Seogwipo-si", nameKr: "서귀포시", lastWinRound: 1125, winPoints: 5 },
    ]
  },
];

export const CURRENT_ROUND = 1160;

export const LATEST_WINNING_NUMBERS = [
  { round: 1160, numbers: [2, 10, 14, 22, 32, 36], bonus: 41 }
];
