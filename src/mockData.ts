import { Student, Teacher, Attendance, PrayerAttendance, ClassJournal, CBTExam, StudentCBTResult, AcademicEvent, TeacherFeedback, ELearningMaterial, WA_NotificationSim } from './types';

// Mock Data Arrays
export const INITIAL_STUDENTS: any[] = [
  {
    id: "26276101",
    name: "ABDURRAHMAN ALI AKBAR",
    pob: "Batu",
    dob: "42014",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "abdurrahman246",
    passwordCbt: "cbt6101",
    usernameParent: "parent_abdurrahmanali",
    passwordParent: "parent6101",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276102",
    name: "ADHWA KHAYRU WAFIE",
    pob: "Batu",
    dob: "41768",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "adhwa975",
    passwordCbt: "cbt6102",
    usernameParent: "parent_adhwakhayru",
    passwordParent: "parent6102",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276103",
    name: "AGGAZIO HAMDHAN EDYATAMA",
    pob: "Batu",
    dob: "41996",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aggazio926",
    passwordCbt: "cbt6103",
    usernameParent: "parent_aggaziohamdhan",
    passwordParent: "parent6103",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276104",
    name: "AHMAD KAFFI ALKAUSAR",
    pob: "Batu",
    dob: "41895",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "ahmad631",
    passwordCbt: "cbt6104",
    usernameParent: "parent_ahmadkaffi",
    passwordParent: "parent6104",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276105",
    name: "AHMAD MUGI RAMADHANI",
    pob: "Batu",
    dob: "41834",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "ahmad457",
    passwordCbt: "cbt6105",
    usernameParent: "parent_ahmadmugi",
    passwordParent: "parent6105",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276106",
    name: "AHMAD NADHIF AKROM ZAMHARIR",
    pob: "Batu",
    dob: "74563",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "ahmad700",
    passwordCbt: "cbt6106",
    usernameParent: "parent_ahmadnadhif",
    passwordParent: "parent6106",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276107",
    name: "AHMAD SULTHAN NAZHIRUL ASROFI",
    pob: "Batu",
    dob: "41776",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "ahmad667",
    passwordCbt: "cbt6107",
    usernameParent: "parent_ahmadsulthan",
    passwordParent: "parent6107",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276108",
    name: "AILIN ZAHRA SHANEZA",
    pob: "Batu",
    dob: "41890",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "ailin715",
    passwordCbt: "cbt6108",
    usernameParent: "parent_ailinzahra",
    passwordParent: "parent6108",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276109",
    name: "AL KAFFI RAVZYA ATATILA ZAKKI MUBBAROK",
    pob: "Batu",
    dob: "42042",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "al588",
    passwordCbt: "cbt6109",
    usernameParent: "parent_alkaffiravzya",
    passwordParent: "parent6109",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276110",
    name: "ALQUENZA CANTIKA GEA JULY RAMA DHANI",
    pob: "Batu",
    dob: "41832",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "alquenza851",
    passwordCbt: "cbt6110",
    usernameParent: "parent_alquenzacantika",
    passwordParent: "parent6110",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276111",
    name: "ALVINO FAJRI ROMADONI",
    pob: "Batu",
    dob: "41834",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "alvino876",
    passwordCbt: "cbt6111",
    usernameParent: "parent_alvinofajri",
    passwordParent: "parent6111",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276112",
    name: "AMIRA LETYSA AZALEA",
    pob: "Batu",
    dob: "42035",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "amira129",
    passwordCbt: "cbt6112",
    usernameParent: "parent_amiraletysa",
    passwordParent: "parent6112",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276113",
    name: "APRELIANO CEVIN NANDRES TEGAR S.A",
    pob: "Batu",
    dob: "41735",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "apreliano880",
    passwordCbt: "cbt6113",
    usernameParent: "parent_aprelianocevin",
    passwordParent: "parent6113",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276114",
    name: "AQILA CALIEF ALBAIHAQI EFENDI",
    pob: "Batu",
    dob: "42020",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aqila332",
    passwordCbt: "cbt6114",
    usernameParent: "parent_aqilacalief",
    passwordParent: "parent6114",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276115",
    name: "ARAYA PUTRIAYU RAMADHANI",
    pob: "Batu",
    dob: "41847",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "araya668",
    passwordCbt: "cbt6115",
    usernameParent: "parent_arayaputriayu",
    passwordParent: "parent6115",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276116",
    name: "ARFIRA NAURA NAJAH AZ ZAHRA",
    pob: "Batu",
    dob: "41878",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "arfira705",
    passwordCbt: "cbt6116",
    usernameParent: "parent_arfiranaura",
    passwordParent: "parent6116",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276117",
    name: "ARJUNA ANANDA AGUSTYA",
    pob: "Batu",
    dob: "41882",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "arjuna637",
    passwordCbt: "cbt6117",
    usernameParent: "parent_arjunaananda",
    passwordParent: "parent6117",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276118",
    name: "ARUF FAHDIL",
    pob: "Batu",
    dob: "41771",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aruf594",
    passwordCbt: "cbt6118",
    usernameParent: "parent_aruffahdil",
    passwordParent: "parent6118",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276119",
    name: "ASYIFA MAULIDYA",
    pob: "Batu",
    dob: "41799",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "asyifa255",
    passwordCbt: "cbt6119",
    usernameParent: "parent_asyifamaulidya",
    passwordParent: "parent6119",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276120",
    name: "AURA JANNETTA SAMARA KHANZA MAULIDIYA",
    pob: "Batu",
    dob: "41641",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aura297",
    passwordCbt: "cbt6120",
    usernameParent: "parent_aurajannetta",
    passwordParent: "parent6120",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276121",
    name: "AURENZA ALZAMECCA SETIAWAN",
    pob: "Batu",
    dob: "42193",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aurenza287",
    passwordCbt: "cbt6121",
    usernameParent: "parent_aurenzaalzamecca",
    passwordParent: "parent6121",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276122",
    name: "AURIZZA SYAWALUL AS SAROH",
    pob: "Batu",
    dob: "41874",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aurizza495",
    passwordCbt: "cbt6122",
    usernameParent: "parent_aurizzasyawalul",
    passwordParent: "parent6122",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276123",
    name: "AVIARA ZETA",
    pob: "Batu",
    dob: "41776",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "aviara450",
    passwordCbt: "cbt6123",
    usernameParent: "parent_aviarazeta",
    passwordParent: "parent6123",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276124",
    name: "AZKA CANDRA FATHANSYAH",
    pob: "Batu",
    dob: "42051",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "azka462",
    passwordCbt: "cbt6124",
    usernameParent: "parent_azkacandrafathansyah",
    passwordParent: "parent6124",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276125",
    name: "BILQIS SINTA VINADIA",
    pob: "Batu",
    dob: "41817",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "bilqis581",
    passwordCbt: "cbt6125",
    usernameParent: "parent_bilqissintavinadia",
    passwordParent: "parent6125",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276126",
    name: "BISMA ALBI BAYU PRATAMA",
    pob: "Batu",
    dob: "41806",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "bisma494",
    passwordCbt: "cbt6126",
    usernameParent: "parent_bismaalbibayu",
    passwordParent: "parent6126",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276127",
    name: "DAFFA AKBAR MAULANA",
    pob: "Batu",
    dob: "41899",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "daffa786",
    passwordCbt: "cbt6127",
    usernameParent: "parent_daffaakbar",
    passwordParent: "parent6127",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276128",
    name: "DAFFA ZENOBIA ZIVEN",
    pob: "Batu",
    dob: "41749",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "daffa161",
    passwordCbt: "cbt6128",
    usernameParent: "parent_daffazenobiaziven",
    passwordParent: "parent6128",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276129",
    name: "DAVA TRISTAN ALANA NISMARA",
    pob: "Batu",
    dob: "41863",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "dava663",
    passwordCbt: "cbt6129",
    usernameParent: "parent_davatristan",
    passwordParent: "parent6129",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276130",
    name: "DZAKIRA ANINDYA ANTYO AZAHRA",
    pob: "Batu",
    dob: "41819",
    className: "Kelas 6-A (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "dzakira329",
    passwordCbt: "cbt6130",
    usernameParent: "parent_dzakiraanindya",
    passwordParent: "parent6130",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276201",
    name: "ELMA PUTRI ANGGISTA",
    pob: "Batu",
    dob: "41915",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "elma325",
    passwordCbt: "cbt6201",
    usernameParent: "parent_elmaputri",
    passwordParent: "parent6201",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276202",
    name: "FAZILAH NUR AQILAH",
    pob: "Batu",
    dob: "41792",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "fazilah785",
    passwordCbt: "cbt6202",
    usernameParent: "parent_fazilahnur",
    passwordParent: "parent6202",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276203",
    name: "FEBRIANA PUTRI NOVITASARI",
    pob: "Ponorogo",
    dob: "42039",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "febriana184",
    passwordCbt: "cbt6203",
    usernameParent: "parent_febrianaputri",
    passwordParent: "parent6203",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276204",
    name: "GAHYAKA ASKANA SAKHI SOBIRIN",
    pob: "Batu",
    dob: "41951",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "gahyaka758",
    passwordCbt: "cbt6204",
    usernameParent: "parent_gahyakaaskana",
    passwordParent: "parent6204",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276205",
    name: "GERY AHMAD ZEKO REVANDO",
    pob: "Batu",
    dob: "41846",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "gery416",
    passwordCbt: "cbt6205",
    usernameParent: "parent_geryahmad",
    passwordParent: "parent6205",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276206",
    name: "HEZEL DWINZA ORIANDA VELOXI",
    pob: "Batu",
    dob: "42044",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "hezel938",
    passwordCbt: "cbt6206",
    usernameParent: "parent_hezeldwinza",
    passwordParent: "parent6206",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276207",
    name: "KENZO HAZQIVARNA PRAJADINATA",
    pob: "Batu",
    dob: "41805",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "kenzo839",
    passwordCbt: "cbt6207",
    usernameParent: "parent_kenzohazqivarna",
    passwordParent: "parent6207",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276208",
    name: "KHAIRUNNISA SYALSABILA",
    pob: "Batu",
    dob: "41764",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "khairunnisa266",
    passwordCbt: "cbt6208",
    usernameParent: "parent_khairunnisasyalsabila",
    passwordParent: "parent6208",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276209",
    name: "KHARINA RAHMADHANI NUR KHOIRIYAH",
    pob: "Batu",
    dob: "41840",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "kharina592",
    passwordCbt: "cbt6209",
    usernameParent: "parent_kharinarahmaddhani",
    passwordParent: "parent6209",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276210",
    name: "LINTANG CANTIKA CAHAYANING QOLBU",
    pob: "Batu",
    dob: "41823",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "lintang282",
    passwordCbt: "cbt6210",
    usernameParent: "parent_lintangcantika",
    passwordParent: "parent6210",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276211",
    name: "MARHADMA ALTAUFIT OREO",
    pob: "Batu",
    dob: "41796",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "marhadma366",
    passwordCbt: "cbt6211",
    usernameParent: "parent_marhadmaaltaufit",
    passwordParent: "parent6211",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276212",
    name: "MUHAMMAD AZKA RISQULLAH",
    pob: "Batu",
    dob: "41859",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "muhammad952",
    passwordCbt: "cbt6212",
    usernameParent: "parent_muhammadazkarisqullah",
    passwordParent: "parent6212",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276213",
    name: "MUHAMMAD ZIDAN ANDREYANSAH",
    pob: "Batu",
    dob: "41997",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "muhammad721",
    passwordCbt: "cbt6213",
    usernameParent: "parent_muhammadzidan",
    passwordParent: "parent6213",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276214",
    name: "NAURA SHEINAFIA MUSTOFA",
    pob: "Batu",
    dob: "42178",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "naura269",
    passwordCbt: "cbt6214",
    usernameParent: "parent_naurasheinafia",
    passwordParent: "parent6214",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276215",
    name: "NENSA VALENTINA",
    pob: "Batu",
    dob: "42048",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "nensa707",
    passwordCbt: "cbt6215",
    usernameParent: "parent_nensavalentina",
    passwordParent: "parent6215",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276216",
    name: "NENSI VALENSIA",
    pob: "Batu",
    dob: "42048",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "nensi835",
    passwordCbt: "cbt6216",
    usernameParent: "parent_nensivalensia",
    passwordParent: "parent6216",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276217",
    name: "NUVAN HADI RISQI YULIANTO",
    pob: "Batu",
    dob: "41612",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "nuvan239",
    passwordCbt: "cbt6217",
    usernameParent: "parent_nuvanhadirisqi",
    passwordParent: "parent6217",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276218",
    name: "PRINCESS ANANDITA ROSANDRY",
    pob: "Batu",
    dob: "41977",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "princess661",
    passwordCbt: "cbt6218",
    usernameParent: "parent_princessanandita",
    passwordParent: "parent6218",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276219",
    name: "RACHEL JANUAR EFRANDA PUTRA PRATAMA",
    pob: "Batu",
    dob: "42005",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "rachel370",
    passwordCbt: "cbt6219",
    usernameParent: "parent_racheljanuar",
    passwordParent: "parent6219",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276220",
    name: "RAHELNO RYAN FEBIANO",
    pob: "Batu",
    dob: "41860",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "rahelno262",
    passwordCbt: "cbt6220",
    usernameParent: "parent_rahelnoryan",
    passwordParent: "parent6220",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276221",
    name: "RANGGA FEBRIANANTA PRASETYA",
    pob: "Batu",
    dob: "42118",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "rangga952",
    passwordCbt: "cbt6221",
    usernameParent: "parent_ranggafebriananta",
    passwordParent: "parent6221",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276222",
    name: "RAUFADLI ALBAIHAKI",
    pob: "Batu",
    dob: "41778",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "raufadli706",
    passwordCbt: "cbt6222",
    usernameParent: "parent_raufadlialbaihaki",
    passwordParent: "parent6222",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276223",
    name: "SAFEEA ZIFTA PRICILLIA ANABELL",
    pob: "Batu",
    dob: "41865",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "safeea999",
    passwordCbt: "cbt6223",
    usernameParent: "parent_safeeazifta",
    passwordParent: "parent6223",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276224",
    name: "SEBASTIAN MAULANA TEGUH DINATA",
    pob: "Batu",
    dob: "41657",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "sebastian127",
    passwordCbt: "cbt6224",
    usernameParent: "parent_sebastianmaulana",
    passwordParent: "parent6224",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276225",
    name: "TEUKU DAFFA MIRZA ANNASYAT",
    pob: "Malang",
    dob: "41933",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "teuku215",
    passwordCbt: "cbt6225",
    usernameParent: "parent_teukudaffa",
    passwordParent: "parent6225",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276226",
    name: "VABRIEL ALFIAN KENAN PUTRA IRAWAN",
    pob: "Batu",
    dob: "41744",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "vabriel262",
    passwordCbt: "cbt6226",
    usernameParent: "parent_vabrielalfian",
    passwordParent: "parent6226",
    religion: "Islam",
    gender: "Laki-laki"
  },
  {
    id: "26276227",
    name: "WILSHA NANDA SARI",
    pob: "Batu",
    dob: "42046",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "wilsha958",
    passwordCbt: "cbt6227",
    usernameParent: "parent_wilshanandasari",
    passwordParent: "parent6227",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276228",
    name: "ZEA ALVIRA PUTRI SEPTYA",
    pob: "Batu",
    dob: "41902",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "zea156",
    passwordCbt: "cbt6228",
    usernameParent: "parent_zeaalvira",
    passwordParent: "parent6228",
    religion: "Islam",
    gender: "Perempuan"
  },
  {
    id: "26276229",
    name: "ZUINA ELFARA FISOKH",
    pob: "Batu",
    dob: "42031",
    className: "Kelas 6-B (SD)",
    parentName: "Budi",
    parentPhone: "08123456789",
    usernameCbt: "zuina747",
    passwordCbt: "cbt6229",
    usernameParent: "parent_zuinaelfara",
    passwordParent: "parent6229",
    religion: "Islam",
    gender: "Perempuan"
  }
];
let initialSyncCompleted = false;
export const INITIAL_TEACHERS: any[] = [
  {
    id: "admin1",
    name: "Admin Utama",
    subject: "Administrator",
    username: "adminutama",
    password: "adminutama",
    classesTaught: "Semua Kelas",
    isHomeroom: false,
    homeroomClass: ""
  }
];

export const INITIAL_ATTENDANCE: any[] = [];
export const INITIAL_JOURNALS: any[] = [];
export const INITIAL_EXAMS: any[] = [];
export const INITIAL_CBT_RESULTS: any[] = [];
export const INITIAL_EVENTS: any[] = [];
export const INITIAL_FEEDBACKS: any[] = [];
export const INITIAL_MATERIALS: any[] = [];
export const INITIAL_MEETS: any[] = [];
export const INITIAL_WA_NOTIFS: WA_NotificationSim[] = [];
export const INITIAL_ASSIGNMENTS: any[] = [];
export const INITIAL_SUBMISSIONS: any[] = [];
export const INITIAL_PRAYER_ATTENDANCE: PrayerAttendance[] = [];

// LocalStorage helpers
export const loadFromStorage = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const storage = key === 'login_session' ? sessionStorage : localStorage;
    const stored = storage.getItem(`adminguruku_v2_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed === null || parsed === undefined) return defaultValue;
      return parsed;
    }
    return defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

const API_URL = 'https://estugadigital.online/api/sync.php';

export const saveToStorage = async <T>(key: string, value: T): Promise<void> => {
  if (typeof window !== 'undefined') {
    try {
      const storage = key === 'login_session' ? sessionStorage : localStorage;
      
      // Do not sync local-only state to API
      if (key === 'login_session' || key === 'is_dark') {
          storage.setItem(`adminguruku_v2_${key}`, JSON.stringify(value));
          return;
      }
      
      if (!initialSyncCompleted) {
          storage.setItem(`adminguruku_v2_${key}`, JSON.stringify(value));
          return;
      }

      let stringified = JSON.stringify(value);
      let payloadToSync = stringified;
      // --- AUTO-FETCH-MERGE FOR CONCURRENT ARRAYS ---
      if (Array.isArray(value) && value.length > 0 && (key === 'submissions' || key === 'results' || key === 'attendance' || key === 'assignments')) {
          try {
             const res = await fetch(API_URL + '?t=' + Date.now(), { cache: 'no-store' });
             if (res.ok) {
                 const serverData = await res.json();
                 if (serverData?.status === 'success' && serverData?.data?.[key]) {
                     const serverArr = typeof serverData.data[key] === 'string' ? JSON.parse(serverData.data[key]) : serverData.data[key];
                     if (Array.isArray(serverArr)) {
                         const mergedMap = new Map();
                         const getId = (item: any) => item.id || (item.examId && item.studentId ? item.examId + '_' + item.studentId : JSON.stringify(item));
                         serverArr.forEach((item: any) => { const uid = getId(item); if(uid) mergedMap.set(uid, item); });
                         value.forEach((item: any) => { const uid = getId(item); if(uid) mergedMap.set(uid, item); });
                         const mergedArr = Array.from(mergedMap.values());
                         stringified = JSON.stringify(mergedArr);
                         payloadToSync = stringified;
                     }
                 }
             }
          } catch(e) {
             console.warn("Auto-fetch-merge failed", e);
          }
      }

      const current = storage.getItem(`adminguruku_v2_${key}`);
      if (current === stringified) {
        return; // Prevent infinite loop if data hasn't changed
      }
      
      try { storage.setItem(`adminguruku_v2_${key}`, stringified); } catch(e) { console.warn("QuotaExceededError for " + key, e); }
      
      // Sync to PHP API on Hostinger
      try {
         await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               doc_id: key,
               doc_data: payloadToSync
            })
         });
      } catch (e) {
         console.warn("Failed to sync to API. Data saved locally.", e);
      }
      
    } catch (e) {
      console.error("Storage error:", e);
    }
  }
};

export const syncAllToServer = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;
  try {
    const keys = [
      'students', 'teachers', 'attendance', 'journals', 'exams',
      'results', 'events', 'feedbacks', 'materials', 'assignments',
      'submissions', 'virtual_meets', 'prayer_attendance', 'settings'
    ];

    let successCount = 0;
    for (const key of keys) {
      const stored = localStorage.getItem(`adminguruku_v2_${key}`);
      if (stored) {
         const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doc_id: key,
            doc_data: stored
          })
        });
        
        const text = await res.text();
        try {
           const json = JSON.parse(text);
           if (res.ok && json.status === 'success') {
               successCount++;
           } else {
               console.error(`Sync failed for ${key}:`, json.message || text);
               throw new Error(json.message || "Unknown error from server");
           }
        } catch(e: any) {
           console.error(`Sync failed for ${key} - Non JSON response:`, text);
           throw new Error(e.message || "Invalid response from server");
        }
      }
    }
    return successCount > 0;
  } catch (e: any) {
    console.error("Failed to force sync:", e);
    throw e;
  }
};

export const syncFromServer = async (): Promise<boolean> => {
  try {
    const res = await fetch(API_URL + '?t=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) throw new Error("API not reachable");
    
    const text = await res.text();
    if (text.trim().startsWith('<?php') || text.trim().startsWith('<')) {
        // Quietly fallback for dev server
        throw new Error("PHP_DEV_SERVER");
    }
    let result;
    try {
        result = JSON.parse(text);
    } catch (e: any) {
        throw new Error("Invalid Response from Server: " + text.substring(0, 100));
    }

    if (result.status !== 'success') throw new Error(result.message || "Unknown API error");
    let hasData = false;
    
        if (result.data) {


        for (const [doc_id, doc_data] of Object.entries(result.data)) {
           if (doc_id === 'login_session' || doc_id === 'is_dark') continue;
           
           if (doc_data !== undefined) {
             const stringified = typeof doc_data === 'string' ? doc_data : JSON.stringify(doc_data);
             try { localStorage.setItem(`adminguruku_v2_${doc_id}`, stringified); } catch(e) { console.warn("QuotaExceededError sync", e); }
             hasData = true;
           }
        }
    }
    
    initialSyncCompleted = true;
    return hasData;
  } catch (e: any) {
    if (e.message !== "PHP_DEV_SERVER") {
      console.warn("Failed to sync from PHP API, falling back to local storage:", e);
    }
    // If API is down (e.g. running on local dev without PHP), we just rely on localStorage
    initialSyncCompleted = true; // allow local saves
    return false;
  }
};
