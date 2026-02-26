// Supabase 프로젝트 정보 및 클라이언트 생성
const SUPABASE_URL = "https://shlnlfqiyrnpepxjjmuh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_LOjVFn8HlLqIkbqVqUqmlg_PJXHG8Dk";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// * 로드 확인용
console.log("Supabase client initialized:", !!supabaseClient);

// 저축 방식 선택에 따라 입력창을 활성/비활성 처리

document.addEventListener("DOMContentLoaded", () => {
  const calculatorTabs = Array.from(
    document.querySelectorAll("[data-section=\"tabs\"] [data-calc-tab]")
  );
  const floatingTabs = document.getElementById("floatingTabs");
  const floatingTabButtons = floatingTabs
    ? Array.from(floatingTabs.querySelectorAll("[data-calc-tab]"))
    : [];
  const allTabButtons = [...calculatorTabs, ...floatingTabButtons];
  const savingAmountTitle = document.getElementById("savingAmountTitle");
  const calcSections = {
    tabs: document.querySelector('[data-section="tabs"]'),
    savingType: document.querySelector('[data-section="saving-type"]'),
    savingAmount: document.querySelector('[data-section="saving-amount"]'),
    savingPeriod: document.querySelector('[data-section="saving-period"]'),
    target: document.querySelector('[data-section="target"]'),
    rate: document.querySelector('[data-section="rate"]'),
    interest: document.querySelector('[data-section="interest"]'),
    result: document.querySelector('[data-section="result"]'),
  };
  const savingAmountFields = {
    deposit: document.querySelector('[data-calc-field="deposit"]'),
    monthly: document.querySelector('[data-calc-field="monthly"]'),
  };
  const calculatorLayouts = {
    target: {
      savingAmountTitle: "저축액",
      order: [
        "savingType",
        "savingAmount",
        "savingPeriod",
        "rate",
        "interest",
        "result",
      ],
      show: {
        savingType: true,
        savingAmount: true,
        savingPeriod: true,
        target: false,
        rate: true,
        interest: true,
        result: true,
      },
    },
    monthly: {
      savingAmountTitle: "월 납입액/예치금",
      order: ["target", "savingType", "savingPeriod", "rate", "interest", "result"],
      show: {
        savingType: true,
        savingAmount: false,
        savingPeriod: true,
        target: true,
        rate: true,
        interest: true,
        result: true,
      },
    },
    period: {
      savingAmountTitle: "월 납입액/예치금",
      order: ["savingType", "target", "savingAmount", "rate", "interest", "result"],
      show: {
        savingType: true,
        savingAmount: true,
        savingPeriod: false,
        target: true,
        rate: true,
        interest: true,
        result: true,
      },
    },
  };
  let activeCalculator = "target";
  const depositCheckbox = document.getElementById("typeDeposit");
  const installmentCheckbox = document.getElementById("typeInstallment");
  const periodMonthsCheckbox = document.getElementById("periodMonths");
  const periodYearsCheckbox = document.getElementById("periodYears");
  const interestSimpleCheckbox = document.getElementById("interestSimple");
  const interestAnnualCompoundCheckbox = document.getElementById(
    "interestAnnualCompound"
  );
  const interestMonthlyCompoundCheckbox = document.getElementById(
    "interestMonthlyCompound"
  );
  const depositInput = document.getElementById("depositAmount");
  const monthlyInput = document.getElementById("monthlyAmount");
  const savingPeriodInput = document.getElementById("savingPeriod");
  const interestRateInput = document.getElementById("interestRate");
  const targetAmountInput = document.getElementById("targetAmount");

  const depositAmountMessage = document.getElementById("depositAmountMessage");
  const monthlyAmountMessage = document.getElementById("monthlyAmountMessage");
  const savingPeriodMessage = document.getElementById("savingPeriodMessage");
  const interestRateMessage = document.getElementById("interestRateMessage");
  const targetAmountMessage = document.getElementById("targetAmountMessage");

  const depositAmountError = document.getElementById("depositAmountError");
  const monthlyAmountError = document.getElementById("monthlyAmountError");
  const savingPeriodError = document.getElementById("savingPeriodError");
  const interestRateError = document.getElementById("interestRateError");
  const targetAmountError = document.getElementById("targetAmountError");

  const resultLabel = document.getElementById("resultLabel");
  const resultValue = document.getElementById("resultValue");
  const resultSummary = document.getElementById("resultSummary");
  const resultGate = document.getElementById("resultGate");
  const showResultButton = document.getElementById("showResultButton");
  const resultGateMessage = document.getElementById("resultGateMessage");
  const resultContent = document.getElementById("resultContent");
  const resetInputsButton = document.getElementById("resetInputsButton");

  const spendItems = Array.from(document.querySelectorAll(".spend-item"));
  const spendInputs = document.getElementById("spend-inputs");
  const spendSavingsInputs = document.getElementById("spend-savings-inputs");
  const spendTableBody = document.getElementById("spend-table-body");
  const topSpendItem = document.getElementById("topSpendItem");
  const spendResultsButton = document.getElementById("spendResultsButton");
  const spendWarningMessage = document.getElementById("spendWarningMessage");
  const spendResultsContainer = document.getElementById("spend-results");
  const principalSummary = document.getElementById("principalSummary");
  const extraSummary = document.getElementById("extraSummary");
  const extraSummaryNote = document.getElementById("extraSummaryNote");
  const dataYear = document.getElementById("dataYear");
  const dataQuarter = document.getElementById("dataQuarter");
  const dataMembers = document.getElementById("dataMembers");
  const householdOptions = Array.from(
    document.querySelectorAll('input[name="household"]')
  );
  const stickyHeader = document.getElementById("stickyHeader");
  const stickyHeaderText = document.getElementById("stickyHeaderText");
  const spendBlock = document.getElementById("spend-block-1");

  const headerMessages = [
    "수입은 고정인데, 돈은 더 모으고 싶다면?",
    "담뱃값 한 달에 5만 원... 아낀다면 얼마까지 모을 수 있을까?",
    "덕질에 매달 20만 원 쓰는데... 많이 쓰는 편인가?",
    "배달음식만 줄였어도 더 모을 수 있을 텐데...",
  ];
  let headerMessageIndex = 0;
  const INTEREST_TAX_RATE = 0.154;
  const AFTER_TAX_INTEREST_RATIO = 1 - INTEREST_TAX_RATE;
  let resultVisible = false;
  const data = {
    "1인 가구": {
      "가구원수": 1,
      "가구주연령": 49,
      "가구분포": 36,
      "소득": 3097748,
      "경상소득": 3040061,
      "근로소득": 1984604,
      "사업소득": 422590,
      "재산소득": 20349,
      "이전소득": 612518,
      "비경상소득": 57687,
      "가계지출": 2367628,
      "소비지출": 1776314,
      "식료품": 234527,
      "주류 · 담배": 35226,
      "의류 · 신발": 73130,
      "주거 · 수도 · 광열": 327563,
      "가정용품 · 가사서비스": 61011,
      "의료": 125554,
      "교통": 184306,
      "통신": 110498,
      "오락 · 문화": 113321,
      "교육": 43816,
      "외식 · 숙박": 328944,
      "기타상품 · 서비스": 138419,
      "비소비지출": 591314,
      "처분가능소득": 2506434,
      "흑자액": 730120,
      "흑자율": 29,
      "평균소비성향": 71,
    },
    "2인 가구": {
      "가구원수": 2,
      "가구주연령": 59,
      "가구분포": 28,
      "소득": 5237638,
      "경상소득": 5089591,
      "근로소득": 2786491,
      "사업소득": 995310,
      "재산소득": 88789,
      "이전소득": 1219002,
      "비경상소득": 148047,
      "가계지출": 3776862,
      "소비지출": 2774757,
      "식료품": 489625,
      "주류 · 담배": 37465,
      "의류 · 신발": 115118,
      "주거 · 수도 · 광열": 301115,
      "가정용품 · 가사서비스": 122321,
      "의료": 262439,
      "교통": 354151,
      "통신": 149368,
      "오락 · 문화": 169887,
      "교육": 79802,
      "외식 · 숙박": 440657,
      "기타상품 · 서비스": 252809,
      "비소비지출": 1002105,
      "처분가능소득": 4235533,
      "흑자액": 1460776,
      "흑자율": 35,
      "평균소비성향": 66,
    },
    "3인 가구": {
      "가구원수": 3,
      "가구주연령": 52,
      "가구분포": 19,
      "소득": 7942409,
      "경상소득": 7818032,
      "근로소득": 5277065,
      "사업소득": 1430320,
      "재산소득": 81893,
      "이전소득": 1028754,
      "비경상소득": 124377,
      "가계지출": 5568204,
      "소비지출": 3948375,
      "식료품": 594528,
      "주류 · 담배": 46084,
      "의류 · 신발": 159736,
      "주거 · 수도 · 광열": 366840,
      "가정용품 · 가사서비스": 199969,
      "의료": 291041,
      "교통": 444574,
      "통신": 222735,
      "오락 · 문화": 244595,
      "교육": 355905,
      "외식 · 숙박": 677766,
      "기타상품 · 서비스": 344601,
      "비소비지출": 1619828,
      "처분가능소득": 6322581,
      "흑자액": 2374206,
      "흑자율": 38,
      "평균소비성향": 62,
    },
    "4인 가구": {
      "가구원수": 4,
      "가구주연령": 49,
      "가구분포": 15,
      "소득": 8432077,
      "경상소득": 8362548,
      "근로소득": 6036710,
      "사업소득": 1402579,
      "재산소득": 43980,
      "이전소득": 879278,
      "비경상소득": 69529,
      "가계지출": 6750656,
      "소비지출": 4977953,
      "식료품": 713946,
      "주류 · 담배": 46859,
      "의류 · 신발": 193911,
      "주거 · 수도 · 광열": 461889,
      "가정용품 · 가사서비스": 186660,
      "의료": 321620,
      "교통": 478812,
      "통신": 274599,
      "오락 · 문화": 298847,
      "교육": 845575,
      "외식 · 숙박": 797490,
      "기타상품 · 서비스": 357746,
      "비소비지출": 1772703,
      "처분가능소득": 6659373,
      "흑자액": 1681420,
      "흑자율": 25,
      "평균소비성향": 75,
    },
    "5인 이상": {
      "가구원수": 5,
      "가구주연령": 47,
      "가구분포": 3,
      "소득": 10265476,
      "경상소득": 10018709,
      "근로소득": 6728565,
      "사업소득": 2073422,
      "재산소득": 72688,
      "이전소득": 1144034,
      "비경상소득": 246767,
      "가계지출": 7651519,
      "소비지출": 5569240,
      "식료품": 764604,
      "주류 · 담배": 47906,
      "의류 · 신발": 229825,
      "주거 · 수도 · 광열": 418578,
      "가정용품 · 가사서비스": 289647,
      "의료": 418944,
      "교통": 459173,
      "통신": 276361,
      "오락 · 문화": 321248,
      "교육": 1089748,
      "외식 · 숙박": 832598,
      "기타상품 · 서비스": 420607,
      "비소비지출": 2082279,
      "처분가능소득": 8183196,
      "흑자액": 2613957,
      "흑자율": 32,
      "평균소비성향": 68,
    },
  };

  // 선택된 저축 방식에 따라 입력창 상태를 바꾼다.
  function updateSavingAmountInputs() {
    const isDeposit = depositCheckbox.checked;
    const isInstallment = installmentCheckbox.checked;
    const hasSavingAmountSection = calcSections.savingAmount
      ? !calcSections.savingAmount.hidden
      : false;
    // 저축액 섹션이 숨겨진 탭에서도 이자 방식 제한은 항상 적용한다.
    updateInterestTypeAvailability();

    if (!hasSavingAmountSection) {
      return;
    }

    if (isDeposit) {
      if (savingAmountFields.deposit) {
        savingAmountFields.deposit.hidden = false;
      }
      if (savingAmountFields.monthly) {
        savingAmountFields.monthly.hidden = true;
      }
      depositInput.disabled = false;
      monthlyInput.disabled = true;
      clearInputState(monthlyInput, monthlyAmountMessage, monthlyAmountError);
      return;
    }

    if (isInstallment) {
      if (savingAmountFields.deposit) {
        savingAmountFields.deposit.hidden = true;
      }
      if (savingAmountFields.monthly) {
        savingAmountFields.monthly.hidden = false;
      }
      depositInput.disabled = true;
      monthlyInput.disabled = false;
      clearInputState(depositInput, depositAmountMessage, depositAmountError);
      return;
    }

    if (savingAmountFields.deposit) {
      savingAmountFields.deposit.hidden = false;
    }
    if (savingAmountFields.monthly) {
      savingAmountFields.monthly.hidden = false;
    }
    depositInput.disabled = true;
    monthlyInput.disabled = true;
  }

  function setActiveCalculator(mode) {
    const layout = calculatorLayouts[mode];
    if (!layout) {
      return;
    }

    activeCalculator = mode;
    if (savingAmountTitle) {
      savingAmountTitle.textContent = layout.savingAmountTitle;
    }

    allTabButtons.forEach((tab) => {
      const isActive = tab.dataset.calcTab === mode;
      tab.classList.toggle("is-active", isActive);
      if (tab.hasAttribute("aria-selected")) {
        tab.setAttribute("aria-selected", String(isActive));
      }
    });

    if (calcSections.tabs) {
      calcSections.tabs.style.order = 0;
    }

    Object.entries(calcSections).forEach(([key, section]) => {
      if (!section || key === "tabs") {
        return;
      }
      const shouldShow = layout.show[key] ?? true;
      section.hidden = !shouldShow;
      section.style.display = shouldShow ? "" : "none";
      section.style.order = 99;
    });

    layout.order.forEach((key, index) => {
      const section = calcSections[key];
      if (!section) {
        return;
      }
      section.style.order = index + 1;
    });

    updateSavingAmountInputs();
    setResultVisibility(false);
  }

  // 기간 단위를 하나만 선택하도록 만든다.
  function updatePeriodUnit(type) {
    if (type === "months") {
      periodMonthsCheckbox.checked = true;
      periodYearsCheckbox.checked = false;
    } else if (type === "years") {
      periodMonthsCheckbox.checked = false;
      periodYearsCheckbox.checked = true;
    }
  }

  // 이자 방식을 하나만 선택하도록 만든다.
  function updateInterestType(type) {
    if (type === "annualCompound" && installmentCheckbox.checked) {
      type = "simple";
    }

    if (type === "simple") {
      interestSimpleCheckbox.checked = true;
      interestAnnualCompoundCheckbox.checked = false;
      interestMonthlyCompoundCheckbox.checked = false;
    } else if (type === "annualCompound") {
      interestSimpleCheckbox.checked = false;
      interestAnnualCompoundCheckbox.checked = true;
      interestMonthlyCompoundCheckbox.checked = false;
    } else if (type === "monthlyCompound") {
      interestSimpleCheckbox.checked = false;
      interestAnnualCompoundCheckbox.checked = false;
      interestMonthlyCompoundCheckbox.checked = true;
    }
  }

  // 적금 선택 시 연복리 선택을 막고, 기존 선택이 연복리라면 단리로 변경한다.
  function updateInterestTypeAvailability() {
    const isInstallment = installmentCheckbox.checked;

    if (isInstallment && interestAnnualCompoundCheckbox.checked) {
      updateInterestType("simple");
    }

    interestAnnualCompoundCheckbox.disabled = isInstallment;
    updatePeriodUnitAvailability();
  }

  // 연복리일 때 기간 단위를 년으로 고정한다.
  function updatePeriodUnitAvailability() {
    if (interestAnnualCompoundCheckbox.checked) {
      updatePeriodUnit("years");
      periodMonthsCheckbox.disabled = true;
      return;
    }

    periodMonthsCheckbox.disabled = false;
  }

  // 입력 상태를 초기화한다.
  function clearInputState(input, messageElement, errorElement) {
    input.value = "";
    messageElement.textContent = "";
    errorElement.textContent = "";
  }

  // 입력값을 숫자로 변환한다.
  function parseNumber(value) {
    const trimmed = value.trim();
    if (trimmed === "") {
      return null;
    }

    const numberValue = Number(trimmed.replace(/,/g, ""));
    if (Number.isNaN(numberValue)) {
      return null;
    }

    return numberValue;
  }

  // 선택된 저축 방식 값 가져오기
  function getSavingType() {
    if (depositCheckbox.checked) {
      return "deposit";
    }
    if (installmentCheckbox.checked) {
      return "installment";
    }
    return null;
  }

  // 선택된 이자 방식 값 가져오기
  function getInterestType() {
    if (interestSimpleCheckbox.checked) {
      return "simple";
    }
    if (interestAnnualCompoundCheckbox.checked) {
      return "annualCompound";
    }
    if (interestMonthlyCompoundCheckbox.checked) {
      return "monthlyCompound";
    }
    return null;
  }

  // 기간을 연/개월 단위로 반환
  function getPeriodValues() {
    const rawPeriod = parseNumber(savingPeriodInput.value);
    if (rawPeriod === null || rawPeriod <= 0) {
      return { years: null, months: null };
    }

    if (periodYearsCheckbox.checked) {
      return { years: rawPeriod, months: rawPeriod * 12 };
    }

    if (periodMonthsCheckbox.checked) {
      return { years: rawPeriod / 12, months: rawPeriod };
    }

    return { years: null, months: null };
  }

  // 수익률 값을 반환 (미입력 시 0)
  function getRateValue() {
    const rawRate = parseNumber(interestRateInput.value);
    if (rawRate === null) {
      return 0;
    }
    return rawRate / 100;
  }

  // 월 이자율을 반환 (연 이자율을 12로 나눈다)
  function getMonthlyRate() {
    return getRateValue() / 12;
  }

  function getAfterTaxAmount(totalAmount, principalAmount) {
    const interest = Math.max(totalAmount - principalAmount, 0);
    return totalAmount - interest * INTEREST_TAX_RATE;
  }

  function getAfterTaxFactor(grossFactor, principalFactor) {
    return (
      grossFactor * AFTER_TAX_INTEREST_RATIO +
      principalFactor * INTEREST_TAX_RATE
    );
  }

  // 이자에 대한 세금(15.4%)을 반영해 최종 금액을 반환한다.
  function applyInterestTax(totalAmount, principalAmount) {
    return Math.round(getAfterTaxAmount(totalAmount, principalAmount));
  }

  function getInstallmentMonthlyCompoundNetAmount(
    monthlySavingAmount,
    monthlyRate,
    months
  ) {
    if (monthlyRate === 0) {
      return monthlySavingAmount * months;
    }

    const growthBase = 1 + monthlyRate;
    const grossFactor =
      growthBase * ((Math.pow(growthBase, months) - 1) / monthlyRate);
    const netFactor = getAfterTaxFactor(grossFactor, months);
    return monthlySavingAmount * netFactor;
  }

  function getInstallmentAnnualCompoundNetAmount(
    monthlySavingAmount,
    annualRate,
    months
  ) {
    if (annualRate === 0) {
      return monthlySavingAmount * months;
    }

    const years = months / 12;
    const grossFactor =
      (1 + annualRate) *
      ((Math.pow(1 + annualRate, years) - 1) / annualRate);
    const netFactor = getAfterTaxFactor(grossFactor, months);
    return monthlySavingAmount * netFactor;
  }

  function solveInstallmentMonthlyCompoundMonths(
    targetAmount,
    monthlySavingAmount,
    monthlyRate
  ) {
    if (targetAmount <= 0 || monthlySavingAmount <= 0) {
      return null;
    }

    if (monthlyRate === 0) {
      return targetAmount / monthlySavingAmount;
    }

    let lower = 0;
    let upper = 1;
    while (
      getInstallmentMonthlyCompoundNetAmount(
        monthlySavingAmount,
        monthlyRate,
        upper
      ) < targetAmount
    ) {
      upper *= 2;
      if (upper > 1200000) {
        return null;
      }
    }

    for (let i = 0; i < 80; i += 1) {
      const mid = (lower + upper) / 2;
      const midAmount = getInstallmentMonthlyCompoundNetAmount(
        monthlySavingAmount,
        monthlyRate,
        mid
      );
      if (midAmount >= targetAmount) {
        upper = mid;
      } else {
        lower = mid;
      }
    }

    return upper;
  }

  function solveInstallmentAnnualCompoundMonths(
    targetAmount,
    monthlySavingAmount,
    annualRate
  ) {
    if (targetAmount <= 0 || monthlySavingAmount <= 0) {
      return null;
    }

    if (annualRate === 0) {
      return targetAmount / monthlySavingAmount;
    }

    let lower = 0;
    let upper = 12;
    while (
      getInstallmentAnnualCompoundNetAmount(
        monthlySavingAmount,
        annualRate,
        upper
      ) < targetAmount
    ) {
      upper *= 2;
      if (upper > 1200000) {
        return null;
      }
    }

    for (let i = 0; i < 80; i += 1) {
      const mid = (lower + upper) / 2;
      const midAmount = getInstallmentAnnualCompoundNetAmount(
        monthlySavingAmount,
        annualRate,
        mid
      );
      if (midAmount >= targetAmount) {
        upper = mid;
      } else {
        lower = mid;
      }
    }

    return upper;
  }

  // 숫자를 보기 좋은 형식으로 변환한다.
  function formatNumber(value) {
    if (value === null || Number.isNaN(value) || !Number.isFinite(value)) {
      return "-";
    }
    return new Intl.NumberFormat("ko-KR").format(value);
  }

  // 숫자 입력 문자열을 정리한다.
  function normalizeNumericInput(rawValue, allowDecimal) {
    const withoutComma = rawValue.replace(/,/g, "");
    if (withoutComma === "") {
      return { normalized: "", isValid: true };
    }

    const validPattern = allowDecimal ? /^\d*\.?\d*$/ : /^\d*$/;
    if (validPattern.test(withoutComma)) {
      return { normalized: withoutComma, isValid: true };
    }

    let sanitized = withoutComma.replace(/[^\d.]/g, "");
    if (!allowDecimal) {
      sanitized = sanitized.replace(/\./g, "");
    } else {
      const firstDotIndex = sanitized.indexOf(".");
      if (firstDotIndex !== -1) {
        sanitized =
          sanitized.slice(0, firstDotIndex + 1) +
          sanitized.slice(firstDotIndex + 1).replace(/\./g, "");
      }
    }

    return { normalized: sanitized, isValid: false };
  }

  // 숫자를 천 단위 콤마로 표시한다.
  function formatWithComma(value, allowDecimal) {
    if (value === "") {
      return "";
    }

    if (!allowDecimal) {
      return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const [integerPart, decimalPart] = value.split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (decimalPart === undefined) {
      return formattedInteger;
    }

    return `${formattedInteger}.${decimalPart}`;
  }

  // 숫자를 억/만/원 단위로 표시한다.
  function formatKoreanCurrency(value) {
    const absoluteValue = Math.floor(Math.abs(value));
    const billionUnit = Math.floor(absoluteValue / 100000000);
    const tenThousandUnit = Math.floor((absoluteValue % 100000000) / 10000);
    const remainder = absoluteValue % 10000;

    const parts = [];
    if (billionUnit > 0) {
      parts.push(`${billionUnit}억`);
    }
    if (tenThousandUnit > 0) {
      parts.push(`${tenThousandUnit}만`);
    }
    if (remainder > 0 || parts.length === 0) {
      parts.push(`${remainder}원`);
    } else {
      parts.push("원");
    }

    return parts.join(" ");
  }

  function getSelectedSpendItems() {
    return spendItems.filter((item) => item.checked).map((item) => item.value);
  }

  function getSelectedHouseholdLabel() {
    const selectedOption = householdOptions.find((option) => option.checked);
    if (!selectedOption) {
      return "1인 가구";
    }
    return selectedOption.parentElement.textContent.trim();
  }

  function renderSpendInputs() {
    const selected = getSelectedSpendItems();
    const previousValues = getSpendInputValues();
    spendInputs.innerHTML = "";

    if (selected.length === 0) {
      spendInputs.innerHTML =
        '<p class="helper-text">선택한 항목이 여기에 표시됩니다.</p>';
      return;
    }

    selected.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "input-group";

      const label = document.createElement("label");
      label.textContent = item;

      const line = document.createElement("div");
      line.className = "inline-input";

      const text = document.createElement("span");
      text.textContent = "한 달에";

      const input = document.createElement("input");
      input.type = "text";
      input.inputMode = "decimal";
      input.placeholder = "숫자 입력";
      input.dataset.spendItem = item;
      if (previousValues[item] !== undefined && previousValues[item] !== null) {
        input.value = formatWithComma(String(previousValues[item]), false);
      }

      const unit = document.createElement("span");
      unit.textContent = "원";

      const error = document.createElement("p");
      error.className = "helper-text";

      line.append(text, input, unit);
      wrapper.append(label, line, error);
      spendInputs.append(wrapper);

      input.addEventListener("input", () => {
        handleNumericInput({
          input,
          messageElement: { textContent: "" },
          errorElement: error,
          allowDecimal: false,
          showCurrencyMessage: false,
        });
        renderSpendSavingsInputs();
        updateSpendTable();
        updateTopSpendItem();
      });
    });
  }

  function renderSpendSavingsInputs() {
    const selected = getSelectedSpendItems();
    const spendValues = getSpendInputValues();
    const previousValues = {};
    const existingInputs = spendSavingsInputs.querySelectorAll(
      "input[data-saving-item]"
    );
    existingInputs.forEach((input) => {
      previousValues[input.dataset.savingItem] = parseNumber(input.value);
    });
    spendSavingsInputs.innerHTML = "";

    if (selected.length === 0) {
      spendSavingsInputs.innerHTML =
        '<p class="helper-text">선택한 항목이 여기에 표시됩니다.</p>';
      updateSavingsInsights();
      return;
    }

    selected.forEach((item) => {
      const wrapper = document.createElement("div");
      wrapper.className = "input-group";

      const line = document.createElement("div");
      line.className = "inline-input";

      const text = document.createElement("span");
      text.textContent = "한 달에";

      const badge = document.createElement("span");
      badge.className = "inline-chip";
      badge.textContent = item;

      const input = document.createElement("input");
      input.type = "range";
      input.className = "spend-savings-slider";
      input.dataset.savingItem = item;
      input.min = "0";
      input.step = "1000";

      const averageValueRaw = spendValues[item];
      const maxValue =
        typeof averageValueRaw === "number" && averageValueRaw > 0
          ? Math.round(averageValueRaw)
          : 0;
      input.max = String(maxValue);

      let initialValue = 0;
      const previousValue = previousValues[item];
      if (typeof previousValue === "number" && previousValue >= 0) {
        initialValue = Math.min(previousValue, maxValue);
      }
      input.value = String(initialValue);

      const valueText = document.createElement("span");
      valueText.className = "slider-value";
      valueText.textContent = formatNumber(initialValue);

      const unit = document.createElement("span");
      unit.textContent = "원 아낄게요";

      const error = document.createElement("p");
      error.className = "helper-text spend-savings-helper";
      error.textContent =
        maxValue > 0
          ? `최대 ${formatNumber(maxValue)}원까지 설정할 수 있어요.`
          : "설정 가능한 금액이 없어요.";

      line.append(text, badge, input, valueText, unit);
      wrapper.append(line, error);
      spendSavingsInputs.append(wrapper);

      input.addEventListener("input", () => {
        const currentValue = parseNumber(input.value) ?? 0;
        valueText.textContent = formatNumber(Math.round(currentValue));
        updateSavingsInsights();
      });
    });

    updateSavingsInsights();
  }

  function getSpendInputValues() {
    const values = {};
    const inputs = spendInputs.querySelectorAll("input[data-spend-item]");
    inputs.forEach((input) => {
      const key = input.dataset.spendItem;
      values[key] = parseNumber(input.value);
    });
    return values;
  }

  function getSpendSavingsValues() {
    const values = {};
    const inputs = spendSavingsInputs.querySelectorAll("input[data-saving-item]");
    inputs.forEach((input) => {
      const key = input.dataset.savingItem;
      values[key] = parseNumber(input.value);
    });
    return values;
  }

  function getTotalSpendSavingsPerMonth() {
    const values = getSpendSavingsValues();
    return Object.values(values).reduce((sum, value) => {
      if (typeof value !== "number" || value <= 0) {
        return sum;
      }
      return sum + value;
    }, 0);
  }

  function updateSpendTable() {
    const selected = getSelectedSpendItems();
    const values = getSpendInputValues();
    const householdLabel = getSelectedHouseholdLabel();
    const householdData = data[householdLabel] ?? data["1인 가구"];
    spendTableBody.innerHTML = "";

    if (selected.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = "<td>-</td><td>-</td><td>&nbsp;</td><td>&nbsp;</td>";
      spendTableBody.append(row);
      return;
    }

    selected.forEach((item) => {
      const row = document.createElement("tr");
      const myValue = values[item];
      const avgValue = householdData?.[item];
      const myText =
        myValue !== null && myValue !== undefined
          ? formatNumber(Math.round(myValue))
          : "-";

      const avgText =
        typeof avgValue === "number"
          ? formatNumber(Math.round(avgValue))
          : "&nbsp;";
      let diffText = "&nbsp;";
      let diffClass = "";
      if (
        typeof avgValue === "number" &&
        myValue !== null &&
        myValue !== undefined
      ) {
        const diffValue = Math.round(myValue - avgValue);
        const absoluteDiff = formatNumber(Math.abs(diffValue));
        if (diffValue > 0) {
          diffText = `+${absoluteDiff}`;
          diffClass = "diff-positive";
        } else {
          diffText = `-${absoluteDiff}`;
          diffClass = "diff-negative";
        }
      }
      const diffCellClassAttribute = diffClass ? ` class="${diffClass}"` : "";

      row.innerHTML = `
        <td>${item}</td>
        <td>${myText}</td>
        <td>${avgText}</td>
        <td${diffCellClassAttribute}>${diffText}</td>
      `;
      spendTableBody.append(row);
    });
  }

  function updateTopSpendItem() {
    const values = getSpendInputValues();
    let maxItem = null;
    let maxValue = -Infinity;
    Object.entries(values).forEach(([item, value]) => {
      if (value !== null && value > maxValue) {
        maxValue = value;
        maxItem = item;
      }
    });
    topSpendItem.textContent = maxItem ?? "—";
  }

  function isSpendBlock2Ready() {
    const selected = getSelectedSpendItems();
    if (selected.length === 0) {
      return false;
    }
    const values = getSpendInputValues();
    return selected.every((item) => {
      const value = values[item];
      return typeof value === "number" && value > 0;
    });
  }

  function isHouseholdSelected() {
    return householdOptions.some((option) => option.checked);
  }

  function showSpendResultsWarning(message) {
    if (spendWarningMessage) {
      spendWarningMessage.textContent = message;
    }
  }

  function clearSpendResultsWarning() {
    if (spendWarningMessage) {
      spendWarningMessage.textContent = "";
    }
  }

  function setLatestQuarter() {
    dataYear.textContent = "2025";
    dataQuarter.textContent = "3";
  }

  function updateHouseholdSelection(selectedValue) {
    householdOptions.forEach((option) => {
      option.checked = option.value === selectedValue;
    });
    const selectedOption = householdOptions.find(
      (option) => option.value === selectedValue
    );
    dataMembers.textContent = selectedOption
      ? selectedOption.parentElement.textContent.trim()
      : selectedValue;
  }

  // 숫자 입력을 처리하고 메시지를 업데이트한다.
  function handleNumericInput({
    input,
    messageElement,
    errorElement,
    allowDecimal,
    showCurrencyMessage,
  }) {
    const rawValue = input.value;
    const { normalized, isValid } = normalizeNumericInput(rawValue, allowDecimal);

    if (!isValid) {
      errorElement.textContent = "숫자만 입력 가능합니다.";
    } else {
      errorElement.textContent = "";
    }

    if (normalized === "") {
      input.value = "";
      messageElement.textContent = "";
      return;
    }

    const formattedValue = formatWithComma(normalized, allowDecimal);
    input.value = formattedValue;

    if (!showCurrencyMessage) {
      messageElement.textContent = "";
      return;
    }

    const numericValue = parseNumber(formattedValue);
    if (numericValue === null) {
      messageElement.textContent = "";
      return;
    }

    messageElement.textContent = formatKoreanCurrency(numericValue);
  }

  function calculateProjectedAmount({
    savingType,
    interestType,
    savingAmount,
    years,
    months,
    annualRate,
    monthlyRate,
  }) {
    if (!savingType || !interestType || savingAmount === null || savingAmount <= 0) {
      return null;
    }

    if (interestType === "simple" && months !== null) {
      if (savingType === "deposit") {
        const gross = savingAmount * (1 + monthlyRate * months);
        return applyInterestTax(gross, savingAmount);
      }

      if (monthlyRate === 0) {
        const gross = savingAmount * months;
        const principal = savingAmount * months;
        return applyInterestTax(gross, principal);
      }

      const factor = months + (monthlyRate * months * (months + 1)) / 2;
      const gross = savingAmount * factor;
      const principal = savingAmount * months;
      return applyInterestTax(gross, principal);
    }

    if (interestType === "annualCompound" && years !== null) {
      if (savingType === "deposit") {
        const gross = savingAmount * Math.pow(1 + annualRate, years);
        return applyInterestTax(gross, savingAmount);
      }

      return null;
    }

    if (interestType === "monthlyCompound" && months !== null) {
      if (savingType === "deposit") {
        const gross = savingAmount * Math.pow(1 + monthlyRate, months);
        return applyInterestTax(gross, savingAmount);
      }

      if (monthlyRate === 0) {
        const gross = savingAmount * months;
        const principal = savingAmount * months;
        return applyInterestTax(gross, principal);
      }

      const factor =
        (1 + monthlyRate) *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const gross = savingAmount * factor;
      const principal = savingAmount * months;
      return applyInterestTax(gross, principal);
    }

    return null;
  }

  // 목표 금액 계산
  function calculateTargetAmount() {
    const savingType = getSavingType();
    const interestType = getInterestType();
    const { years, months } = getPeriodValues();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();
    const savingAmount =
      savingType === "deposit"
        ? parseNumber(depositInput.value)
        : parseNumber(monthlyInput.value);

    return calculateProjectedAmount({
      savingType,
      interestType,
      savingAmount,
      years,
      months,
      annualRate,
      monthlyRate,
    });
  }

  function calculateAdditionalSavingAmount() {
    const savingType = getSavingType();
    const interestType = getInterestType();
    const { years, months } = getPeriodValues();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();
    const monthlySaved = getTotalSpendSavingsPerMonth();

    if (!savingType || !interestType || months === null || months <= 0) {
      return null;
    }

    if (monthlySaved <= 0) {
      return 0;
    }

    const savingAmount =
      savingType === "deposit" ? monthlySaved * months : monthlySaved;

    return calculateProjectedAmount({
      savingType,
      interestType,
      savingAmount,
      years,
      months,
      annualRate,
      monthlyRate,
    });
  }

  function isCalculatorInputReady() {
    const savingType = getSavingType();
    const interestType = getInterestType();
    const hasPeriodUnit = periodMonthsCheckbox.checked || periodYearsCheckbox.checked;
    const periodValue = parseNumber(savingPeriodInput.value);
    const hasPeriod = hasPeriodUnit && periodValue !== null && periodValue > 0;
    const hasTarget = parseNumber(targetAmountInput.value) !== null &&
      parseNumber(targetAmountInput.value) > 0;
    const hasDeposit = parseNumber(depositInput.value) !== null &&
      parseNumber(depositInput.value) > 0;
    const hasMonthly = parseNumber(monthlyInput.value) !== null &&
      parseNumber(monthlyInput.value) > 0;

    if (!savingType || !interestType) {
      return false;
    }

    if (activeCalculator === "target") {
      return hasPeriod && (savingType === "deposit" ? hasDeposit : hasMonthly);
    }

    if (activeCalculator === "monthly") {
      return hasPeriod && hasTarget;
    }

    if (activeCalculator === "period") {
      return hasTarget && (savingType === "deposit" ? hasDeposit : hasMonthly);
    }

    return false;
  }

  function calculateSavingPeriodWithAmount(savingType, savingAmount) {
    const target = parseNumber(targetAmountInput.value);
    const interestType = getInterestType();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();

    if (!savingType || !interestType || savingAmount === null || savingAmount <= 0) {
      return null;
    }

    if (target === null || target <= 0) {
      return null;
    }

    const needed = target;
    if (needed <= 0) {
      return 0;
    }
    if (savingType === "deposit" && savingAmount >= needed) {
      return 0;
    }

    if (interestType === "simple") {
      if (savingType === "deposit") {
        if (monthlyRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const denominator = AFTER_TAX_INTEREST_RATIO * monthlyRate;
        if (denominator === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const months = (needed / savingAmount - 1) / denominator;
        return months >= 0 ? months : null;
      }

      if (monthlyRate === 0) {
        return needed / savingAmount;
      }

      const effectiveMonthlyRate = AFTER_TAX_INTEREST_RATIO * monthlyRate;
      const a = (savingAmount * effectiveMonthlyRate) / 2;
      const b = savingAmount * (1 + effectiveMonthlyRate / 2);
      const c = -needed;
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) {
        return null;
      }
      const months = (-b + Math.sqrt(discriminant)) / (2 * a);
      return months >= 0 ? months : null;
    }

    if (interestType === "annualCompound") {
      if (savingType === "deposit") {
        if (annualRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const requiredGrowth =
          (needed / savingAmount - INTEREST_TAX_RATE) /
          AFTER_TAX_INTEREST_RATIO;
        if (requiredGrowth <= 0) {
          return null;
        }
        const years =
          Math.log(requiredGrowth) / Math.log(1 + annualRate);
        return years >= 0 ? years * 12 : null;
      }

      return null;
    }

    if (interestType === "monthlyCompound") {
      if (savingType === "deposit") {
        if (monthlyRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const requiredGrowth =
          (needed / savingAmount - INTEREST_TAX_RATE) /
          AFTER_TAX_INTEREST_RATIO;
        if (requiredGrowth <= 0) {
          return null;
        }
        const months =
          Math.log(requiredGrowth) / Math.log(1 + monthlyRate);
        return months >= 0 ? months : null;
      }

      const months = solveInstallmentMonthlyCompoundMonths(
        needed,
        savingAmount,
        monthlyRate
      );
      return months >= 0 ? months : null;
    }

    return null;
  }

  function updateSavingsInsights() {
    if (!principalSummary || !extraSummary || !extraSummaryNote) {
      return;
    }

    const monthlySaved = getTotalSpendSavingsPerMonth();
    const yearlySaved = monthlySaved * 12;
    principalSummary.textContent =
      `한달에 ${formatNumber(Math.round(monthlySaved))}원, ` +
      `1년에 ${formatNumber(Math.round(yearlySaved))}원이에요.`;

    extraSummaryNote.textContent = "";

    if (!isCalculatorInputReady()) {
      extraSummary.textContent =
        "위의 계산기에 입력한 기간, 이자율에 맞게 추가 저축 금액을 더한 값을 알려드려요.";
      return;
    }

    const savingType = getSavingType();

    if (activeCalculator === "period") {
      const currentSavingAmount =
        savingType === "deposit"
          ? parseNumber(depositInput.value)
          : parseNumber(monthlyInput.value);
      const adjustedSavingAmount =
        savingType === "deposit"
          ? (currentSavingAmount ?? 0) + yearlySaved
          : (currentSavingAmount ?? 0) + monthlySaved;
      const newPeriod = calculateSavingPeriodWithAmount(
        savingType,
        adjustedSavingAmount
      );

      if (newPeriod === null || Number.isNaN(newPeriod)) {
        extraSummary.textContent =
          "입력 값을 확인하면 추가 저축 기간을 계산할 수 있어요.";
        return;
      }

      const roundedMonths = formatNumber(Math.round(newPeriod));
      extraSummary.textContent =
        `저축기간을 ${roundedMonths}개월로 줄일 수 있어요.`;
      extraSummaryNote.textContent =
        "위의 예적금 계산기에 입력한 저축 방식, 이율, 기간을 적용한 금액이에요.";
      if (savingType === "deposit") {
        const roundedSavingAmount = formatNumber(Math.round(yearlySaved));
        extraSummaryNote.textContent =
          `위의 예적금 계산기에 입력한 저축 방식, 이율, 기간을 적용한 금액이에요. ` +
          `예금의 경우에는 1년 동안 모을 수 있는 추가 저축 금액 ${roundedSavingAmount}원을 예치금에 더해서 계산해요.`;
      }
      return;
    }

    const extraAmount = calculateAdditionalSavingAmount();

    if (extraAmount === null || Number.isNaN(extraAmount)) {
      extraSummary.textContent =
        "입력 값을 확인하면 추가 저축 금액을 계산할 수 있어요.";
      return;
    }

    const roundedExtra = formatNumber(Math.round(extraAmount));

    if (activeCalculator === "target") {
      const baseTarget = calculateTargetAmount();
      if (baseTarget === null || Number.isNaN(baseTarget)) {
        extraSummary.textContent =
          "입력 값을 확인하면 추가 저축 금액을 계산할 수 있어요.";
        return;
      }

      const totalAmount = Math.round(baseTarget) + Math.round(extraAmount);
      const percentIncrease =
        baseTarget > 0
          ? truncateToOneDecimal((extraAmount / baseTarget) * 100)
          : 0;

      extraSummary.textContent =
        `• 저축 기간 동안 ${roundedExtra}원을 추가로 모을 수 있어요.\n` +
        `• 총 저축 금액은 ${formatNumber(totalAmount)}원이에요.\n` +
        `• 추가로 저축하지 않을 때보다 ${formatNumber(percentIncrease)}% 증가해요!`;
      extraSummaryNote.textContent =
        "위의 예적금 계산기에 입력한 저축 방식, 이율, 기간을 적용한 금액이에요.";
      return;
    }

    if (activeCalculator === "monthly") {
      const targetValue = parseNumber(targetAmountInput.value);
      if (targetValue === null || Number.isNaN(targetValue)) {
        extraSummary.textContent =
          "입력 값을 확인하면 추가 저축 금액을 계산할 수 있어요.";
        return;
      }

      const totalAmount = Math.round(targetValue) + Math.round(extraAmount);
      const percentIncrease =
        targetValue > 0
          ? truncateToOneDecimal((extraAmount / targetValue) * 100)
          : 0;

      extraSummary.textContent =
        `• 저축 기간 동안 ${roundedExtra}원을 추가로 모을 수 있어요.\n` +
        `• 총 저축 금액은 ${formatNumber(totalAmount)}원이에요.\n` +
        `• 추가로 저축하지 않을 때보다 ${formatNumber(percentIncrease)}% 증가해요!`;
      extraSummaryNote.textContent =
        "위의 예적금 계산기에 입력한 저축 방식, 이율, 기간을 적용한 금액이에요.";
      return;
    }

    if (activeCalculator === "period") {
      return;
    }
  }

  // 필요한 월 납입액 계산
  function calculateMonthlyAmount() {
    const savingType = getSavingType();
    const target = parseNumber(targetAmountInput.value);
    const interestType = getInterestType();
    const { years, months } = getPeriodValues();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();

    if (!savingType || !interestType || target === null || target <= 0) {
      return null;
    }

    const needed = target;
    if (needed <= 0) {
      return 0;
    }

    if (interestType === "simple" && months !== null) {
      if (savingType === "deposit") {
        const grossFactor = 1 + monthlyRate * months;
        const netFactor = getAfterTaxFactor(grossFactor, 1);
        return netFactor > 0 ? needed / netFactor : null;
      }

      if (monthlyRate === 0) {
        return needed / months;
      }

      const grossFactor = months + (monthlyRate * months * (months + 1)) / 2;
      const netFactor = getAfterTaxFactor(grossFactor, months);
      return netFactor > 0 ? needed / netFactor : null;
    }

    if (interestType === "annualCompound" && years !== null) {
      if (savingType === "deposit") {
        const grossFactor = Math.pow(1 + annualRate, years);
        const netFactor = getAfterTaxFactor(grossFactor, 1);
        return netFactor > 0 ? needed / netFactor : null;
      }

      return null;
    }

    if (interestType === "monthlyCompound" && months !== null) {
      if (savingType === "deposit") {
        const grossFactor = Math.pow(1 + monthlyRate, months);
        const netFactor = getAfterTaxFactor(grossFactor, 1);
        return netFactor > 0 ? needed / netFactor : null;
      }

      if (monthlyRate === 0) {
        return needed / months;
      }

      const grossFactor =
        (1 + monthlyRate) *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      const netFactor = getAfterTaxFactor(grossFactor, months);
      return netFactor > 0 ? needed / netFactor : null;
    }

    return null;
  }

  // 필요한 저축기간 계산
  function calculateSavingPeriod() {
    const savingType = getSavingType();
    const savingAmount =
      savingType === "deposit"
        ? parseNumber(depositInput.value)
        : parseNumber(monthlyInput.value);
    const target = parseNumber(targetAmountInput.value);
    const interestType = getInterestType();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();

    if (!savingType || !interestType || savingAmount === null || savingAmount <= 0) {
      return null;
    }

    if (target === null || target <= 0) {
      return null;
    }

    const needed = target;
    if (needed <= 0) {
      return 0;
    }

    if (interestType === "simple") {
      if (savingType === "deposit") {
        if (monthlyRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const denominator = AFTER_TAX_INTEREST_RATIO * monthlyRate;
        if (denominator === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const months = (needed / savingAmount - 1) / denominator;
        return months >= 0 ? months : null;
      }

      if (monthlyRate === 0) {
        return needed / savingAmount;
      }

      const effectiveMonthlyRate = AFTER_TAX_INTEREST_RATIO * monthlyRate;
      const a = (savingAmount * effectiveMonthlyRate) / 2;
      const b = savingAmount * (1 + effectiveMonthlyRate / 2);
      const c = -needed;
      const discriminant = b * b - 4 * a * c;
      if (discriminant < 0) {
        return null;
      }
      const months = (-b + Math.sqrt(discriminant)) / (2 * a);
      return months >= 0 ? months : null;
    }

    if (interestType === "annualCompound") {
      if (savingType === "deposit") {
        if (annualRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const requiredGrowth =
          (needed / savingAmount - INTEREST_TAX_RATE) /
          AFTER_TAX_INTEREST_RATIO;
        if (requiredGrowth <= 0) {
          return null;
        }
        const years =
          Math.log(requiredGrowth) / Math.log(1 + annualRate);
        return years >= 0 ? years * 12 : null;
      }

      return null;
    }

    if (interestType === "monthlyCompound") {
      if (savingType === "deposit") {
        if (monthlyRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const requiredGrowth =
          (needed / savingAmount - INTEREST_TAX_RATE) /
          AFTER_TAX_INTEREST_RATIO;
        if (requiredGrowth <= 0) {
          return null;
        }
        const months =
          Math.log(requiredGrowth) / Math.log(1 + monthlyRate);
        return months >= 0 ? months : null;
      }

      const months = solveInstallmentMonthlyCompoundMonths(
        needed,
        savingAmount,
        monthlyRate
      );
      return months >= 0 ? months : null;
    }

    return null;
  }

  function formatPeriodValue(months) {
    if (months === null || Number.isNaN(months)) {
      return "-";
    }
    const useYears = periodYearsCheckbox.checked;
    const value = useYears ? months / 12 : months;
    const label = useYears ? "년" : "개월";
    return `${formatNumber(value)} ${label}`;
  }

  function truncateToOneDecimal(value) {
    return Math.floor(value * 10) / 10;
  }

  function enforcePeriodSavingAmountLimit() {
    const LIMIT_ERROR_MESSAGE = "목표 금액보다 크게 입력할 수 없어요.";
    const clearLimitError = (errorElement) => {
      if (errorElement.textContent === LIMIT_ERROR_MESSAGE) {
        errorElement.textContent = "";
      }
    };

    if (activeCalculator !== "period") {
      clearLimitError(depositAmountError);
      clearLimitError(monthlyAmountError);
      return;
    }

    const targetValue = parseNumber(targetAmountInput.value);
    if (targetValue === null || targetValue <= 0) {
      clearLimitError(depositAmountError);
      clearLimitError(monthlyAmountError);
      return;
    }

    const capInputValue = (input, messageElement, errorElement) => {
      const numericValue = parseNumber(input.value);
      if (numericValue === null) {
        clearLimitError(errorElement);
        return;
      }

      if (numericValue > targetValue) {
        input.value = formatWithComma(String(targetValue), false);
        messageElement.textContent = formatKoreanCurrency(targetValue);
        errorElement.textContent = LIMIT_ERROR_MESSAGE;
        return;
      }

      clearLimitError(errorElement);
    };

    capInputValue(depositInput, depositAmountMessage, depositAmountError);
    capInputValue(monthlyInput, monthlyAmountMessage, monthlyAmountError);
  }

  function setResultVisibility(visible) {
    resultVisible = visible;
    if (resultGate) {
      resultGate.hidden = visible;
    }
    if (resultContent) {
      resultContent.hidden = !visible;
    }
  }

  function getMissingSectionTitle() {
    const savingType = getSavingType();
    const interestType = getInterestType();
    const hasPeriodUnit = periodMonthsCheckbox.checked || periodYearsCheckbox.checked;
    const periodValue = parseNumber(savingPeriodInput.value);
    const hasPeriod = hasPeriodUnit && periodValue !== null && periodValue > 0;
    const targetValue = parseNumber(targetAmountInput.value);
    const hasTarget = targetValue !== null && targetValue > 0;
    const depositValue = parseNumber(depositInput.value);
    const monthlyValue = parseNumber(monthlyInput.value);
    const hasDeposit = depositValue !== null && depositValue > 0;
    const hasMonthly = monthlyValue !== null && monthlyValue > 0;
    const interestRateValue = parseNumber(interestRateInput.value);
    const hasRate = interestRateValue !== null && interestRateValue >= 0;

    const savingAmountTitleText =
      savingAmountTitle?.textContent?.trim() || "저축액";

    const checksByTab = {
      target: [
        { ok: !!savingType, title: "저축 방식" },
        {
          ok: savingType === "deposit" ? hasDeposit : hasMonthly,
          title: savingAmountTitleText,
        },
        { ok: hasPeriod, title: "저축기간" },
        { ok: hasRate, title: "이자율" },
        { ok: !!interestType, title: "이자 방식" },
      ],
      monthly: [
        { ok: hasTarget, title: "목표금액" },
        { ok: !!savingType, title: "저축 방식" },
        { ok: hasPeriod, title: "저축기간" },
        { ok: hasRate, title: "이자율" },
        { ok: !!interestType, title: "이자 방식" },
      ],
      period: [
        { ok: !!savingType, title: "저축 방식" },
        { ok: hasTarget, title: "목표금액" },
        {
          ok: savingType === "deposit" ? hasDeposit : hasMonthly,
          title: savingAmountTitleText,
        },
        { ok: hasRate, title: "이자율" },
        { ok: !!interestType, title: "이자 방식" },
      ],
    };

    const checks = checksByTab[activeCalculator] || [];
    const missing = checks.find((item) => !item.ok);
    return missing ? missing.title : null;
  }

  function updateResultGate() {
    if (!resultGateMessage || resultVisible) {
      return;
    }
    const missingTitle = getMissingSectionTitle();
    if (missingTitle) {
      resultGateMessage.textContent = `${missingTitle} 값이 비어 있어요.`;
      if (showResultButton) {
        showResultButton.disabled = true;
      }
    } else {
      resultGateMessage.textContent = "";
      if (showResultButton) {
        showResultButton.disabled = false;
      }
    }
  }

  // 결과 표시 업데이트
  function updateResults() {
    setResultVisibility(resultVisible);
    enforcePeriodSavingAmountLimit();
    const interestType = getInterestType();
    const savingType = getSavingType();
    const monthlyAmount = parseNumber(monthlyInput.value);
    const depositAmount = parseNumber(depositInput.value);
    const targetValue = parseNumber(targetAmountInput.value);
    const { months: periodMonths } = getPeriodValues();
    updateSavingsInsights();
    updateResultGate();

    if (!interestType) {
      resultValue.textContent = "-";
      resultSummary.textContent = "";
      return;
    }

    if (activeCalculator === "target") {
      resultLabel.textContent = "목표 금액";
      const target = calculateTargetAmount();
      resultValue.textContent =
        target === null ? "-" : formatNumber(Math.round(target));

      if (
        target === null ||
        (savingType === "deposit" ? depositAmount === null : monthlyAmount === null) ||
        periodMonths === null
      ) {
        resultSummary.textContent = "";
        return;
      }

      const roundedSavingAmount = formatNumber(
        Math.round(savingType === "deposit" ? depositAmount : monthlyAmount)
      );
      const roundedTarget = formatNumber(Math.round(target));
      const roundedMonths = formatNumber(Math.round(periodMonths));
      if (savingType === "deposit") {
        resultSummary.textContent =
          `${roundedSavingAmount}원을 약 ${roundedMonths}개월 동안 예치하면, ` +
          `총 ${roundedTarget}원을 모을 수 있어요.`;
      } else {
        resultSummary.textContent =
          `월 ${roundedSavingAmount}원씩 ${roundedMonths}개월 동안 납입하면, ` +
          `총 ${roundedTarget}원을 모을 수 있어요.`;
      }
      return;
    }

    if (activeCalculator === "period") {
      resultLabel.textContent = "필요 저축기간";
      const period = calculateSavingPeriod();
      const truncatedPeriod =
        period === null || Number.isNaN(period) ? period : truncateToOneDecimal(period);
      resultValue.textContent = formatPeriodValue(truncatedPeriod);

      if (
        truncatedPeriod === null ||
        (savingType === "deposit" ? depositAmount === null : monthlyAmount === null) ||
        targetValue === null
      ) {
        resultSummary.textContent = "";
        return;
      }

      const roundedSavingAmount = formatNumber(
        Math.round(savingType === "deposit" ? depositAmount : monthlyAmount)
      );
      const roundedTarget = formatNumber(Math.round(targetValue));
      const roundedMonths = formatNumber(Math.round(truncatedPeriod));
      if (savingType === "deposit") {
        resultSummary.textContent =
          `${roundedSavingAmount}원을 예치하면 목표 금액 ${roundedTarget}원을 ` +
          `모으는 데 약 ${roundedMonths}개월 걸려요.`;
      } else {
        resultSummary.textContent =
          `월 ${roundedSavingAmount}원씩 납입하면 목표 금액 ${roundedTarget}원을 ` +
          `모으는 데 약 ${roundedMonths}개월 걸려요.`;
      }
      return;
    }

  if (activeCalculator === "monthly") {
      if (savingType === "deposit") {
        resultLabel.textContent = "필요 예치금";
      } else {
        resultLabel.textContent = "필요 월 납입액";
      }
      const monthly = calculateMonthlyAmount();
      resultValue.textContent =
        monthly === null ? "-" : formatNumber(Math.round(monthly));

      if (monthly === null || targetValue === null || periodMonths === null) {
        resultSummary.textContent = "";
        return;
      }

      const roundedSavingAmount = formatNumber(Math.round(monthly));
      const roundedTarget = formatNumber(Math.round(targetValue));
      const roundedMonths = formatNumber(Math.round(periodMonths));
      if (savingType === "deposit") {
        resultSummary.textContent =
          `목표 금액 ${roundedTarget}원을 ${roundedMonths}개월 동안 모으려면 ` +
          `예치금은 약 ${roundedSavingAmount}원이에요.`;
      } else {
        resultSummary.textContent =
          `목표 금액 ${roundedTarget}원을 ${roundedMonths}개월 동안 모으려면 ` +
          `월 납입액은 약 ${roundedSavingAmount}원이에요.`;
      }
    }
  }

  // 예금/적금 체크박스를 서로 배타적으로 동작하게 만든다.
  function selectSavingType(type) {
    if (type === "deposit") {
      depositCheckbox.checked = true;
      installmentCheckbox.checked = false;
    } else if (type === "installment") {
      depositCheckbox.checked = false;
      installmentCheckbox.checked = true;
    }

    updateSavingAmountInputs();
  }

  depositCheckbox.addEventListener("change", () => {
    if (depositCheckbox.checked) {
      selectSavingType("deposit");
    }

    updateSavingAmountInputs();
    updateResults();
  });

  installmentCheckbox.addEventListener("change", () => {
    if (installmentCheckbox.checked) {
      selectSavingType("installment");
    }

    updateSavingAmountInputs();
    updateResults();
  });

  periodMonthsCheckbox.addEventListener("change", () => {
    if (periodMonthsCheckbox.checked) {
      updatePeriodUnit("months");
    }
    updateResults();
  });

  periodYearsCheckbox.addEventListener("change", () => {
    if (periodYearsCheckbox.checked) {
      updatePeriodUnit("years");
    }
    updateResults();
  });

  interestSimpleCheckbox.addEventListener("change", () => {
    if (interestSimpleCheckbox.checked) {
      updateInterestType("simple");
    }
    updatePeriodUnitAvailability();
    updateResults();
  });

  interestAnnualCompoundCheckbox.addEventListener("change", () => {
    if (interestAnnualCompoundCheckbox.checked) {
      updateInterestType("annualCompound");
    }
    updatePeriodUnitAvailability();
    updateResults();
  });

  interestMonthlyCompoundCheckbox.addEventListener("change", () => {
    if (interestMonthlyCompoundCheckbox.checked) {
      updateInterestType("monthlyCompound");
    }
    updatePeriodUnitAvailability();
    updateResults();
  });

  [
    depositInput,
    monthlyInput,
    savingPeriodInput,
    interestRateInput,
    targetAmountInput,
  ].forEach(
    (input) => {
      input.addEventListener("input", () => {
        if (input === depositInput) {
          handleNumericInput({
            input,
            messageElement: depositAmountMessage,
            errorElement: depositAmountError,
            allowDecimal: false,
            showCurrencyMessage: true,
          });
        } else if (input === monthlyInput) {
          handleNumericInput({
            input,
            messageElement: monthlyAmountMessage,
            errorElement: monthlyAmountError,
            allowDecimal: false,
            showCurrencyMessage: true,
          });
        } else if (input === savingPeriodInput) {
          handleNumericInput({
            input,
            messageElement: savingPeriodMessage,
            errorElement: savingPeriodError,
            allowDecimal: true,
            showCurrencyMessage: false,
          });
        } else if (input === interestRateInput) {
          handleNumericInput({
            input,
            messageElement: interestRateMessage,
            errorElement: interestRateError,
            allowDecimal: true,
            showCurrencyMessage: false,
          });
        } else if (input === targetAmountInput) {
          handleNumericInput({
            input,
            messageElement: targetAmountMessage,
            errorElement: targetAmountError,
            allowDecimal: false,
            showCurrencyMessage: true,
          });
        }

        updateResults();
      });
    }
  );

  allTabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      setActiveCalculator(tab.dataset.calcTab);
      updateResults();
    });
  });

// ============================================================
// *** supabase 맵핑 + payload 생성 + 중복저장 방지 처리 ***
// ============================================================

/**
 * [설정] Supabase에 실제로 insert할 "테이블명"을 여기에 입력해야 함.
 * - 어디서 정하나? Supabase Dashboard > Table Editor에서 만든 테이블 이름.
 * - 아직 미정이면 ""로 두고, 확정되면 문자열로 채우기.
 */
const SAVINGS_TABLE_NAME = "calc_submissions"; // 테이블명 = calc_submissions

/**
 * [설정] DB 컬럼명 매핑
 * - payload의 key(좌측)가 DB 컬럼명(우측)과 반드시 1:1로 맞아야 함.
 * - 아직 컬럼 설계가 확정되지 않았다면 ""로 비워두고,
 *   아래 "어떤 컬럼이 필요" 섹션 참고해서 Supabase에 컬럼 생성 후 채워 넣기.
 */
const DB_COLUMNS = {
  client_id: "client_id",
  payload_hash: "payload_hash",
  created_at: "created_at",
  calculator_mode: "calculator_mode",
  saving_type: "saving_type",
  interest_type: "interest_type",
  period_unit: "period_unit",
  period_value_raw: "period_value_raw",
  period_months: "period_months",
  annual_rate_ratio: "annual_rate_ratio",
  annual_rate: "annual_rate",
  deposit_amount: "deposit_amount",
  monthly_amount: "monthly_amount",
  target_amount: "target_amount",
  result_label: "result_label",
  result_value_text: "result_value_text",
  household_label: "household_label",
  spend_selected: "spend_selected",
  spend_inputs: "spend_inputs",
  spend_savings: "spend_savings",
};

/**
 * [기능] 동일 접속 환경(브라우저) 식별자 생성/유지
 * - localStorage에 한 번 생성해두고 계속 재사용
 * - 목적: "같은 접속 환경에서 동일 값 중복 저장 방지"의 기준값 중 하나
 */
function getOrCreateClientId() {
  const STORAGE_KEY = "sc_client_id";

  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing && typeof existing === "string") return existing;

  // uuid 생성(브라우저 지원)
  const newId =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : String(Date.now()) + "-" + String(Math.random()).slice(2);

  localStorage.setItem(STORAGE_KEY, newId);
  return newId;
}

/**
 * [기능] 객체를 "해시 입력용"으로 안정적으로 문자열화 (키 순서 고정)
 * - JSON.stringify는 기본적으로 객체 key 순서를 100% 보장하지 않으므로
 *   key 정렬 후 stringify해서 동일 입력 => 동일 문자열 보장
 */
function stableStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return "[" + obj.map(stableStringify).join(",") + "]";
  }

  const keys = Object.keys(obj).sort();
  return (
    "{" +
    keys
      .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
      .join(",") +
    "}"
  );
}

/**
 * [기능] SHA-256 해시 생성 (payload 중복 판정에 사용)
 * - 반환: hex 문자열
 */
async function sha256Hex(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * [3단계 핵심] "DB에 저장할 payload"를 만든다.
 *
 * 설계 포인트:
 * - 화면에 표시된 결과값(resultValue.textContent) + 계산의 입력들(각 input 값) + 소비 입력들까지
 * - "개인 식별 가능 정보"는 넣지 않기 (너의 정책 유지)
 * - 저장 단위는 "사용자가 결과 확인 버튼을 눌렀을 때의 스냅샷" 1회
 */
function buildPayloadSnapshot() {
  const savingType = getSavingType(); // "deposit" | "installment" | null
  const interestType = getInterestType(); // "simple" | "annualCompound" | "monthlyCompound" | null
  const period = getPeriodValues(); // { years, months }

  const periodUnit = periodYearsCheckbox.checked
    ? "years"
    : periodMonthsCheckbox.checked
      ? "months"
      : null;

  // 입력 숫자 값들
  const depositAmount = parseNumber(depositInput.value);
  const monthlyAmount = parseNumber(monthlyInput.value);
  const savingPeriodRaw = parseNumber(savingPeriodInput.value);
  const targetAmount = parseNumber(targetAmountInput.value);

  // 이자율: 네 코드에서는 getRateValue()가 "ratio(예: 0.045)"를 반환
  const annualRateRatio = getRateValue();
  const annualRatePercent = annualRateRatio * 100;

  // 소비 파트 입력들
  const householdLabel = getSelectedHouseholdLabel();
  const spendSelected = getSelectedSpendItems();
  const spendInputsObj = getSpendInputValues();
  const spendSavingsObj = getSpendSavingsValues();

  // 화면 결과(표시용) - 이미 updateResults()가 반영해둔 값
  const resultLabelText = resultLabel?.textContent ?? null;
  const resultValueText = resultValue?.textContent ?? null;

  return {
    calculator_mode: activeCalculator ?? null,
    saving_type: savingType,
    interest_type: interestType,

    period_unit: periodUnit,
    period_value_raw: savingPeriodRaw,
    period_months: period.months,

    annual_rate_ratio: annualRateRatio,
    annual_rate: annualRatePercent,

    deposit_amount: depositAmount,
    monthly_amount: monthlyAmount,
    target_amount: targetAmount,

    result_label: resultLabelText,
    result_value_text: resultValueText,

    household_label: householdLabel,
    spend_selected: spendSelected,
    spend_inputs: spendInputsObj,
    spend_savings: spendSavingsObj,
  };
}

/**
 * [기능] payload를 DB row 형태로 변환한다.
 * - DB 컬럼명이 아직 확정되지 않았으니, DB_COLUMNS를 채워 넣기 전까지는 동작 불가.
 * - 확정 후에는 아래 mapping이 곧 "insert row"가 됨.
 */
function mapPayloadToDbRow({ clientId, payloadHash, payload }) {
  // DB 컬럼명이 하나라도 비어 있으면, 지금은 저장 불가(명확히 실패 처리)
  const requiredKeys = ["client_id", "payload_hash"];

  for (const k of requiredKeys) {
    if (!DB_COLUMNS[k] || DB_COLUMNS[k].trim() === "") {
      throw new Error(
        `DB_COLUMNS.${k} 가 비어 있습니다. (Supabase 컬럼명 확정 필요)`
      );
    }
  }

  if (!SAVINGS_TABLE_NAME || SAVINGS_TABLE_NAME.trim() === "") {
    throw new Error(
      "SAVINGS_TABLE_NAME 이 비어 있습니다. (Supabase 테이블명 확정 필요)"
    );
  }

  // row 생성
  const row = {};

  // 필수
  row[DB_COLUMNS.client_id] = clientId;
  row[DB_COLUMNS.payload_hash] = payloadHash;

  // 선택(있으면 넣기)
  if (DB_COLUMNS.created_at && DB_COLUMNS.created_at.trim() !== "") {
    // created_at을 서버 기본값(now())로 쓸 거면 이 줄은 빼도 됨
    row[DB_COLUMNS.created_at] = new Date().toISOString();
  }

  // payload의 각 필드 매핑(컬럼명이 비어있으면 스킵)
  Object.entries(payload).forEach(([payloadKey, payloadValue]) => {
    const col = DB_COLUMNS[payloadKey];
    if (!col || col.trim() === "") return;

    // JSON 저장이 필요하면: Supabase 컬럼 타입을 jsonb로 만들면 그대로 객체/배열 넣어도 됨
    row[col] = payloadValue;
  });

  return row;
}

/**
 * [4단계 핵심] Supabase에 insert한다.
 * - "동일 접속 환경(client_id) + 동일 입력(payload_hash)"이면 중복 저장이 되지 않게 만든다.
 * - 이 중복 방지는 "DB의 unique 제약조건"이 있어야 완성된다. (아래 B 섹션 SQL 참고)
 */
async function insertSnapshotToSupabase() {
  const clientId = getOrCreateClientId();
  const payload = buildPayloadSnapshot();

  // 중복 판정용 hash는 "clientId 제외한 payload 내용"을 기준으로 만들 것
  // (같은 브라우저에서 같은 값 중복 저장 방지 목적)
  const hashInput = stableStringify(payload);
  const payloadHash = await sha256Hex(hashInput);

  const row = mapPayloadToDbRow({ clientId, payloadHash, payload });

  /**
   * insert 전략:
   * - DB에 (client_id, payload_hash) unique 제약이 걸려 있으면,
   *   같은 값 insert 시 "중복 에러"가 발생한다.
   * - 그 에러를 "정상(중복 방지 성공)"으로 간주해도 되고,
   *   또는 upsert + ignore 형태로 처리할 수도 있다.
   *
   * 아래는 "중복이면 에러가 나도 사용자 경험상 실패로 보지 않는" 방식.
   */
  const { error } = await supabaseClient.from(SAVINGS_TABLE_NAME).insert(row);

  if (!error) {
    return { status: "inserted" };
  }

  // 중복(Unique violation)인 경우를 "중복 저장 방지 성공"으로 처리
  // Postgres unique violation SQLSTATE: 23505
  if (error.code === "23505") {
    return { status: "duplicate_ignored" };
  }

  // 그 외는 진짜 오류
  throw error;
}

//*setSaveMessage(text) 함수 삭제함
  
// =================================================
// *** payload, 맵핑, 중복저장방지 생성 끝 ***
// =================================================
  
  if (showResultButton) {
    showResultButton.addEventListener("click", async () => {
      setResultVisibility(true);
      updateResults();
      
      try {
        const res = await insertSnapshotToSupabase();
        console.log("save result:", res.status);
      } catch (e) {
        console.error("save failed:", e);
      }
    });
  }

  function resetAllInputs() {
    clearInputState(depositInput, depositAmountMessage, depositAmountError);
    clearInputState(monthlyInput, monthlyAmountMessage, monthlyAmountError);
    clearInputState(savingPeriodInput, savingPeriodMessage, savingPeriodError);
    clearInputState(interestRateInput, interestRateMessage, interestRateError);
    clearInputState(targetAmountInput, targetAmountMessage, targetAmountError);

    depositCheckbox.checked = false;
    installmentCheckbox.checked = false;
    periodMonthsCheckbox.checked = false;
    periodYearsCheckbox.checked = false;
    interestSimpleCheckbox.checked = false;
    interestAnnualCompoundCheckbox.checked = false;
    interestMonthlyCompoundCheckbox.checked = false;

    spendItems.forEach((item) => {
      item.checked = false;
    });
    householdOptions.forEach((option) => {
      option.checked = false;
    });

    renderSpendInputs();
    renderSpendSavingsInputs();
    updateSpendTable();
    updateTopSpendItem();
    updateHouseholdSelection("1");
    clearSpendResultsWarning();
    if (spendResultsContainer) {
      spendResultsContainer.hidden = true;
    }

    updateInterestTypeAvailability();
    updatePeriodUnitAvailability();
    updateSavingAmountInputs();
    setResultVisibility(false);
    updateResults();
  }

  if (resetInputsButton) {
    resetInputsButton.addEventListener("click", resetAllInputs);
  }

  if (floatingTabs && calcSections.tabs) {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          floatingTabs.classList.remove("is-visible");
        } else {
          floatingTabs.classList.add("is-visible");
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(calcSections.tabs);
  }

  updatePeriodUnit("months");
  updateInterestType("simple");
  updateInterestTypeAvailability();
  updatePeriodUnitAvailability();
  setActiveCalculator(activeCalculator);
  updateSavingAmountInputs();
  setResultVisibility(false);
  updateResults();

  function rotateHeaderMessage() {
    if (!stickyHeaderText) {
      return;
    }
    headerMessageIndex = (headerMessageIndex + 1) % headerMessages.length;
    stickyHeaderText.textContent = headerMessages[headerMessageIndex];
  }

  if (stickyHeaderText) {
    stickyHeaderText.textContent = headerMessages[headerMessageIndex];
    setInterval(rotateHeaderMessage, 20000);
  }

  if (stickyHeader) {
    const moveToSpendBlock = () => {
      if (!spendBlock) {
        return;
      }
      spendBlock.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    stickyHeader.addEventListener("click", moveToSpendBlock);
    stickyHeader.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        moveToSpendBlock();
      }
    });
  }

  setLatestQuarter();
  updateHouseholdSelection("1");
  renderSpendInputs();
  renderSpendSavingsInputs();
  updateSpendTable();
  updateTopSpendItem();

  spendItems.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      renderSpendInputs();
      renderSpendSavingsInputs();
      updateSpendTable();
      updateTopSpendItem();
      clearSpendResultsWarning();
      if (spendResultsContainer && !spendResultsContainer.hidden) {
        updateSavingsInsights();
      }
    });
  });

  householdOptions.forEach((option) => {
    option.addEventListener("change", () => {
      if (option.checked) {
        updateHouseholdSelection(option.value);
        renderSpendSavingsInputs();
        updateSpendTable();
        clearSpendResultsWarning();
      }
    });
  });

  if (spendResultsButton) {
    spendResultsButton.addEventListener("click", async() => {
      if (getSelectedSpendItems().length === 0) {
        showSpendResultsWarning("소비항목을 선택해주세요.");
        return;
      }

      if (!isSpendBlock2Ready()) {
        showSpendResultsWarning("평균 소비 금액을 입력해주세요.");
        return;
      }

      if (!isHouseholdSelected()) {
        showSpendResultsWarning("가구원 수를 선택해주세요.");
        return;
      }

      clearSpendResultsWarning();
      if (spendResultsContainer) {
        spendResultsContainer.hidden = false;
        spendResultsContainer.removeAttribute("hidden");
        spendResultsContainer.style.display = "block";
        spendResultsContainer.style.visibility = "visible";
      }
      updateSpendTable();
      updateTopSpendItem();
      updateSavingsInsights();

      setResultVisibility(true);
      updateResults();

      const prevDisabled = spendResultsButton.disabled;
      spendResultsButton.disabled = true;

      try {
        const res = await insertSnapshotToSupabase();
      
        if (res?.status === "inserted") {
          if (location.hostname === "localhost") {
            console.log("[DB] 저장 완료!");
          }
      
        } else if (res?.status === "duplicate_ignored") {
          if (location.hostname === "localhost") {
            console.log("[DB] 중복 저장 방지됨");
          }
      
        } else {
          if (location.hostname === "localhost") {
            console.log("[DB] 알 수 없는 상태");
          }
        }
      
      } catch (e) {
        if (location.hostname === "localhost") {
          console.error(e);
          console.log("[DB] 저장 실패:");
        }
      
      } finally {
        spendResultsButton.disabled = prevDisabled;
      }
    });
  }
});
