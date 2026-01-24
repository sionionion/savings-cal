// 저축 방식 선택에 따라 입력창을 활성/비활성 처리

document.addEventListener("DOMContentLoaded", () => {
  const depositCheckbox = document.getElementById("typeDeposit");
  const installmentCheckbox = document.getElementById("typeInstallment");
  const periodMonthsCheckbox = document.getElementById("periodMonths");
  const periodYearsCheckbox = document.getElementById("periodYears");
  const rateAnnualCheckbox = document.getElementById("rateAnnual");
  const rateMonthlyCheckbox = document.getElementById("rateMonthly");
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

  const resultTargetAmount = document.getElementById("resultTargetAmount");
  const resultSavingAmount = document.getElementById("resultSavingAmount");
  const resultSavingPeriod = document.getElementById("resultSavingPeriod");
  const resultSummary = document.getElementById("resultSummary");

  // 선택된 저축 방식에 따라 입력창 상태를 바꾼다.
  function updateSavingAmountInputs() {
    const isDeposit = depositCheckbox.checked;
    const isInstallment = installmentCheckbox.checked;

    if (isDeposit) {
      depositInput.disabled = false;
      monthlyInput.disabled = true;
      clearInputState(monthlyInput, monthlyAmountMessage, monthlyAmountError);
      return;
    }

    if (isInstallment) {
      depositInput.disabled = true;
      monthlyInput.disabled = false;
      clearInputState(depositInput, depositAmountMessage, depositAmountError);
      return;
    }

    // 아무것도 선택되지 않으면 둘 다 입력 가능
    depositInput.disabled = false;
    monthlyInput.disabled = false;
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

  // 수익률 단위를 하나만 선택하도록 만든다.
  function updateRateUnit(type) {
    if (type === "annual") {
      rateAnnualCheckbox.checked = true;
      rateMonthlyCheckbox.checked = false;
    } else if (type === "monthly") {
      rateAnnualCheckbox.checked = false;
      rateMonthlyCheckbox.checked = true;
    }
  }

  // 이자 방식을 하나만 선택하도록 만든다.
  function updateInterestType(type) {
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

  // 연복리일 때 기간 단위를 년으로 고정한다.
  function updatePeriodUnitAvailability() {
    if (interestAnnualCompoundCheckbox.checked) {
      updatePeriodUnit("years");
      periodMonthsCheckbox.disabled = true;
      rateMonthlyCheckbox.disabled = true;
      updateRateUnit("annual");
      return;
    }

    periodMonthsCheckbox.disabled = false;
    rateMonthlyCheckbox.disabled = false;
  }

  // 계산 가능한 값이 모두 입력되면 해당 입력창을 비활성화한다.
  function updateComputedInputStates() {
    const savingType = getSavingType();
    const hasPeriodUnit = periodMonthsCheckbox.checked || periodYearsCheckbox.checked;
    const hasRateUnit = rateAnnualCheckbox.checked || rateMonthlyCheckbox.checked;
    const savingAmountReady =
      savingType === "deposit"
        ? isPositiveNumber(depositInput)
        : savingType === "installment"
          ? isPositiveNumber(monthlyInput)
          : false;
    const targetReady = isPositiveNumber(targetAmountInput);
    const periodReady = hasPeriodUnit && isPositiveNumber(savingPeriodInput);
    const rateReady = hasRateUnit && isRateValueReady();
    targetAmountInput.disabled =
      savingAmountReady && periodReady && rateReady;

    if (savingType === "deposit") {
      depositInput.disabled =
        targetReady && periodReady && rateReady;
    } else if (savingType === "installment") {
      monthlyInput.disabled =
        targetReady && periodReady && rateReady;
    }

    savingPeriodInput.disabled =
      targetReady && savingAmountReady && rateReady;
  }

  // 입력 상태를 초기화한다.
  function clearInputState(input, messageElement, errorElement) {
    input.value = "";
    messageElement.textContent = "";
    errorElement.textContent = "";
  }

  // 숫자가 0보다 큰지 확인한다.
  function isPositiveNumber(input) {
    const parsed = parseNumber(input.value);
    return parsed !== null && parsed > 0;
  }

  // 수익률 입력이 비었거나 숫자로 입력됐는지 확인한다.
  function isRateValueReady() {
    const rawValue = interestRateInput.value.trim();
    if (rawValue === "") {
      return true;
    }
    return parseNumber(rawValue) !== null;
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

  // 월 이자율을 반환 (연 이자율 선택 시에만 12로 나눈다)
  function getMonthlyRate() {
    const rate = getRateValue();
    if (rateAnnualCheckbox.checked) {
      return rate / 12;
    }
    return rate;
  }

  // 이자에 대한 세금(15.4%)을 반영해 최종 금액을 반환한다.
  function applyInterestTax(totalAmount, principalAmount) {
    const interest = Math.max(totalAmount - principalAmount, 0);
    const netAmount = totalAmount - interest * 0.154;
    return Math.round(netAmount);
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

  // 목표 금액 계산
  function calculateTargetAmount() {
    const savingType = getSavingType();
    const interestType = getInterestType();
    const { years, months } = getPeriodValues();
    const annualRate = getRateValue();
    const monthlyRate = getMonthlyRate();

    let savingAmount = null;
    if (savingType === "deposit") {
      savingAmount = parseNumber(depositInput.value);
    } else if (savingType === "installment") {
      savingAmount = parseNumber(monthlyInput.value);
    }

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

      if (annualRate === 0) {
        const gross = savingAmount * years;
        const principal = savingAmount * (months ?? 0);
        return applyInterestTax(gross, principal);
      }

      const factor =
        (1 + annualRate) *
        ((Math.pow(1 + annualRate, years) - 1) / annualRate);
      const gross = savingAmount * factor;
      const principal = savingAmount * (months ?? 0);
      return applyInterestTax(gross, principal);
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

  // 필요한 저축액 계산
  function calculateSavingAmount() {
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
        return needed / (1 + monthlyRate * months);
      }

      if (monthlyRate === 0) {
        return needed / months;
      }

      const factor = months + (monthlyRate * months * (months + 1)) / 2;
      return needed / factor;
    }

    if (interestType === "annualCompound" && years !== null) {
      if (savingType === "deposit") {
        return needed / Math.pow(1 + annualRate, years);
      }

      if (annualRate === 0) {
        return needed / years;
      }

      const factor =
        (1 + annualRate) *
        ((Math.pow(1 + annualRate, years) - 1) / annualRate);
      return needed / factor;
    }

    if (interestType === "monthlyCompound" && months !== null) {
      if (savingType === "deposit") {
        return needed / Math.pow(1 + monthlyRate, months);
      }

      if (monthlyRate === 0) {
        return needed / months;
      }

      const factor =
        (1 + monthlyRate) *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      return needed / factor;
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
        const months = (needed / savingAmount - 1) / monthlyRate;
        return months >= 0 ? months : null;
      }

      if (monthlyRate === 0) {
        return needed / savingAmount;
      }

      const a = (savingAmount * monthlyRate) / 2;
      const b = savingAmount * (1 + monthlyRate / 2);
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
        const years =
          Math.log(needed / savingAmount) / Math.log(1 + annualRate);
        return years >= 0 ? years * 12 : null;
      }

      if (annualRate === 0) {
        return needed / savingAmount;
      }

      const numerator =
        1 + (needed * annualRate) / (savingAmount * (1 + annualRate));
      if (numerator <= 0) {
        return null;
      }
      const years = Math.log(numerator) / Math.log(1 + annualRate);
      return years >= 0 ? years * 12 : null;
    }

    if (interestType === "monthlyCompound") {
      if (savingType === "deposit") {
        if (monthlyRate === 0) {
          return needed === savingAmount ? 0 : null;
        }
        const months =
          Math.log(needed / savingAmount) / Math.log(1 + monthlyRate);
        return months >= 0 ? months : null;
      }

      if (monthlyRate === 0) {
        return needed / savingAmount;
      }

      const numerator =
        1 + (needed * monthlyRate) / (savingAmount * (1 + monthlyRate));
      if (numerator <= 0) {
        return null;
      }
      const months = Math.log(numerator) / Math.log(1 + monthlyRate);
      return months >= 0 ? months : null;
    }

    return null;
  }

  // 결과 표시 업데이트
  function updateResults() {
    const target = calculateTargetAmount();
    const savingAmount = calculateSavingAmount();
    const period = calculateSavingPeriod();
    const savingType = getSavingType();
    const interestType = getInterestType();
    const useYears = periodYearsCheckbox.checked;
    const useMonths = periodMonthsCheckbox.checked;

    const inputTarget = parseNumber(targetAmountInput.value);
    const targetValue =
      inputTarget !== null && inputTarget > 0 ? inputTarget : target;

    let inputSavingAmount = null;
    if (savingType === "deposit") {
      inputSavingAmount = parseNumber(depositInput.value);
    } else if (savingType === "installment") {
      inputSavingAmount = parseNumber(monthlyInput.value);
    }

    const savingAmountValue =
      inputSavingAmount !== null && inputSavingAmount > 0
        ? inputSavingAmount
        : savingAmount;

    if (targetValue === null || Number.isNaN(targetValue)) {
      resultTargetAmount.textContent = "-";
    } else {
      resultTargetAmount.textContent = formatNumber(Math.round(targetValue));
    }
    resultSavingAmount.textContent = formatNumber(savingAmountValue);

    const inputPeriod = parseNumber(savingPeriodInput.value);
    const periodFromInput =
      inputPeriod !== null && inputPeriod > 0 && (useYears || useMonths);

    if (!periodFromInput && (period === null || Number.isNaN(period))) {
      resultSavingPeriod.textContent = "-";
      resultSummary.textContent = "";
      updateComputedInputStates();
      return;
    }

    let periodValue = period;
    let periodLabel = "개월";
    let periodMonths = null;

    if (periodFromInput) {
      periodValue = inputPeriod;
      periodLabel = useYears ? "년" : "개월";
      periodMonths = useYears ? inputPeriod * 12 : inputPeriod;
    } else if (period !== null) {
      if (interestType === "annualCompound") {
        periodValue = period / 12;
        periodLabel = "년";
      } else if (useYears) {
        periodValue = period / 12;
        periodLabel = "년";
      } else {
        periodValue = period;
        periodLabel = "개월";
      }
      periodMonths = period;
    }

    resultSavingPeriod.textContent = `${formatNumber(periodValue)} ${periodLabel}`;

    if (
      targetValue === null ||
      savingAmountValue === null ||
      !savingType ||
      !interestType ||
      Number.isNaN(targetValue) ||
      Number.isNaN(savingAmountValue)
    ) {
      resultSummary.textContent = "";
      updateComputedInputStates();
      return;
    }

    if (periodMonths === null || Number.isNaN(periodMonths)) {
      resultSummary.textContent = "";
      updateComputedInputStates();
      return;
    }

    const roundedTarget = formatNumber(Math.round(targetValue));
    const roundedSavingAmount = formatNumber(Math.round(savingAmountValue));
    const roundedMonths = formatNumber(Math.round(periodMonths));

    if (savingType === "deposit") {
      resultSummary.textContent =
        `${roundedSavingAmount}원을 약 ${roundedMonths}개월 동안 예치하면, ` +
        `총 약 ${roundedTarget}원을 모을 수 있어요.`;
      updateComputedInputStates();
      return;
    }

    resultSummary.textContent =
      `월 ${roundedSavingAmount}원씩 ${roundedMonths}개월 동안 모으면, ` +
      `총 ${roundedTarget}원을 모을 수 있어요.`;
    updateComputedInputStates();
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

  rateAnnualCheckbox.addEventListener("change", () => {
    if (rateAnnualCheckbox.checked) {
      updateRateUnit("annual");
    }
    updateResults();
  });

  rateMonthlyCheckbox.addEventListener("change", () => {
    if (rateMonthlyCheckbox.checked) {
      updateRateUnit("monthly");
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

  [depositInput, monthlyInput, savingPeriodInput, interestRateInput, targetAmountInput].forEach(
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

  updateSavingAmountInputs();
  updatePeriodUnitAvailability();
  updateResults();
});
