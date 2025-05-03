// This file contains the knowledge base for the AI assistant

export function getInitialMessage(): string {
  return "Magandang araw po! Ako po si MARIA, ang inyong friendly AI Agent mula sa PlataPay. Paano ko po kayo matutulungan sa inyong PlataPay application ngayong araw?"
}

export function getSuggestions(currentStep: number): string[] {
  const commonQuestions = ["Ano ang PlataPay?", "Gaano katagal bago ma-approve?"]

  const stepSpecificSuggestions: Record<number, string[]> = {
    0: ["Anong mga ID ang tinatanggap?", "Bakit kailangan ang personal information ko?", "Secure ba ang data ko?"],
    1: [
      "Kailangan ba ng business experience?",
      "Paano kung wala akong business experience?",
      "Pwede bang idagdag ang PlataPay sa existing business ko?",
    ],
    2: [
      "Paano ko mahahanap ang location coordinates ko?",
      "Paano kung hindi ko alam ang barangay ko?",
      "Pwede bang mag-operate sa multiple locations?",
    ],
    3: [
      "Anong plan ang pinakamainam para sa beginners?",
      "Ano ang mga commission rates?",
      "Pwede bang mag-upgrade ng plan later?",
    ],
    4: [
      "Anong mga dokumento ang kailangan kong ihanda?",
      "Anong format dapat ang files ko?",
      "Paano kung wala akong business permit?",
    ],
    5: ["Sino ang nag-rereview ng application ko?", "Ano ang mangyayari pagkatapos ng assessment?"],
    6: ["Ano ang mangyayari pagkatapos ng activation?", "Paano ko gagamitin ang system?"],
  }

  return [...(stepSpecificSuggestions[currentStep] || []), ...commonQuestions].slice(0, 4)
}

export function getResponseForQuery(query: string, currentStep: number): string {
  // Convert query to lowercase for easier matching
  const q = query.toLowerCase()

  // General PlataPay information
  if (q.includes("ano ang platapay") || q.includes("about platapay") || q.includes("what is platapay")) {
    return "Ang PlataPay ay isang nangungunang financial technology company sa Pilipinas na nagbibigay ng digital payment solutions. Bilang isang PlataPay agent, makakapag-alok ka ng mga serbisyo tulad ng bills payment, e-loading, remittance, at iba pang financial transactions sa mga customer sa iyong lugar."
  }

  if (
    q.includes("gaano katagal") &&
    (q.includes("approval") || q.includes("process") || q.includes("take") || q.includes("bago ma-approve"))
  ) {
    return "Ang application process ay karaniwang tumatagal ng 5-7 business days mula sa submission hanggang approval, kung kumpleto at na-verify na ang lahat ng iyong dokumento. Makakatanggap ka ng updates sa pamamagitan ng email tungkol sa status ng iyong application."
  }

  if (q.includes("commission") || q.includes("earn") || q.includes("income") || q.includes("kita")) {
    return "Ang mga commission rates ay nag-iiba batay sa iyong napiling plan at uri ng transaction. Ang Basic plans ay nagsisimula sa commission na 50-70% ng service fee, habang ang Premium plans ay nag-aalok ng hanggang 80-90%. Mas maraming transactions ang iyong ma-process, mas mataas ang potential earnings mo."
  }

  // Step-specific responses
  if (currentStep === 0) {
    if ((q.includes("id") && q.includes("accept")) || q.includes("tinatanggap")) {
      return "Ang PlataPay ay tumatanggap ng iba't ibang government-issued IDs kabilang ang: Passport, Driver's License, SSS ID, GSIS ID, PhilHealth ID, Voter's ID, Postal ID, at National ID. Siguraduhin na valid at hindi expired ang iyong ID."
    }

    if (q.includes("bakit") && q.includes("personal information")) {
      return "Ang iyong personal information ay kinakailangan para sa KYC (Know Your Customer) compliance, na inuutos ng Bangko Sentral ng Pilipinas (BSP) para sa mga financial service providers. Ito ay tumutulong na maiwasan ang fraud at tinitiyak ang seguridad ng mga financial transactions."
    }

    if (q.includes("data") && (q.includes("secure") || q.includes("ligtas"))) {
      return "Oo, ang iyong data ay secure. Ang PlataPay ay nagpapatupad ng industry-standard security measures at sumusunod sa Data Privacy Act of 2012 (Republic Act 10173). Ang iyong impormasyon ay naka-encrypt at ginagamit lamang para sa mga layuning nakasaad sa aming privacy policy."
    }
  }

  if (currentStep === 1) {
    if (q.includes("kailangan") && q.includes("business experience")) {
      return "Hindi, hindi mahigpit na kinakailangan ang nakaraang business experience para maging PlataPay agent. Gayunpaman, ang pagkakaroon ng ilang business background ay makakatulong. Ang PlataPay ay nagbibigay ng training at support para tulungan ang mga bagong agents na magtagumpay, kahit na ito ang iyong unang business venture."
    }

    if (q.includes("wala") && q.includes("business experience")) {
      return "Okay lang yan! Maraming matagumpay na PlataPay agents ang nagsimula nang walang nakaraang business experience. Ang mga pangunahing requirements ay dedikasyon, magandang lokasyon, at kahandaang matuto. Ang PlataPay ay nagbibigay ng training materials at support para tulungan kang magsimula."
    }

    if (q.includes("idagdag") && q.includes("existing business")) {
      return "Oo, maaari mong idagdag ang mga serbisyo ng PlataPay sa iyong existing business! Ito ay isang magandang paraan para dagdagan ang foot traffic at magdagdag ng karagdagang revenue stream. Maraming sari-sari stores, internet cafes, at iba pang maliliit na negosyo ang matagumpay na nag-integrate ng mga serbisyo ng PlataPay."
    }
  }

  if (currentStep === 2) {
    if (
      q.includes("location coordinates") ||
      q.includes("find my location") ||
      (q.includes("hanap") && q.includes("location"))
    ) {
      return "Makukuha mo ang iyong location coordinates sa pamamagitan ng pag-click sa 'Get My Location' button, na gagamit ng GPS ng iyong device. Kung hindi ito gumagana, maaari mong gamitin ang mapa para manu-manong ilagay ang marker sa iyong business location. Ang mga tumpak na coordinates ay tumutulong sa PlataPay na masuri ang strategic value ng iyong lokasyon."
    }

    if (q.includes("hindi") && q.includes("alam") && q.includes("barangay")) {
      return "Kung hindi ka sigurado tungkol sa iyong barangay, maaari mong tingnan ang iyong utility bills o property documents. O kaya naman, maaari mong piliin muna ang iyong region, province, at city, at pagkatapos ay pumili mula sa mga available na barangay sa dropdown menu."
    }

    if (q.includes("multiple locations") || q.includes("maraming location")) {
      return "Sa simula, ang bawat application ay para sa isang business location lamang. Gayunpaman, kapag ikaw ay naging established PlataPay agent na, maaari kang mag-apply para sa karagdagang mga lokasyon sa ilalim ng parehong account. Ang bawat lokasyon ay kailangang dumaan sa sarili nitong approval process."
    }
  }

  if (currentStep === 3) {
    if ((q.includes("best") || q.includes("pinakamainam")) && q.includes("beginner")) {
      return "Para sa mga beginners, ang Basic Plan (₱499) ay kadalasang ang pinakamainam na pagpipilian para magsimula. Ito ay may mas mababang initial investment ngunit nagbibigay pa rin ng lahat ng essential services. Habang lumalaki ang iyong transaction volume, maaari mong isaalang-alang ang pag-upgrade sa Plus o Premium plans para sa mas mataas na commission rates at karagdagang benefits."
    }

    if ((q.includes("upgrade") && q.includes("later")) || (q.includes("upgrade") && q.includes("mamaya"))) {
      return "Oo, maaari kang mag-upgrade ng plan anumang oras pagkatapos maging active agent. Maraming agents ang nagsisimula sa Basic Plan at nag-upgrade habang lumalaki ang kanilang negosyo. Ang mga plan upgrades ay maaaring hilingin sa pamamagitan ng iyong agent portal at karaniwang may bisa sa loob ng 1-2 business days."
    }
  }

  if (currentStep === 4) {
    if (q.includes("dokumento") && (q.includes("kailangan") || q.includes("ihanda"))) {
      return "Ang mahahalagang dokumento na kailangan mong ihanda ay:\n1. Valid government-issued ID (harap at likod)\n2. Selfie kasama ang iyong ID\n3. Proof of address (utility bill na hindi lalagpas sa 3 buwan)\n\nKung mayroon kang existing business, dapat mo ring isama ang iyong business permit. Ang lahat ng dokumento ay dapat malinaw, nababasa, at nasa JPG, PNG, o PDF format."
    }

    if (q.includes("format") && q.includes("file")) {
      return "Maaari mong i-upload ang iyong mga dokumento sa JPG, PNG, o PDF format. Ang bawat file ay hindi dapat lumampas sa 5MB. Siguraduhin na malinaw ang mga larawan at nababasa ang lahat ng text. Ang mga malabo o hindi kumpletong dokumento ay maaaring magpabagal sa iyong application process."
    }

    if (q.includes("wala") && q.includes("business permit")) {
      return "Kung wala ka pang business permit, maaari ka pa ring mag-apply bilang individual agent. Gayunpaman, inirerekomenda namin ang pagkuha ng tamang business registration para sa iyong PlataPay agency. Maaari kang mag-apply ng business permit sa iyong local municipal o city hall. Ang PlataPay ay maaaring magbigay ng certification letter para suportahan ang iyong business permit application kung kinakailangan."
    }
  }

  // Default responses based on keywords
  if (q.includes("requirements") || q.includes("kailangan")) {
    return "Para maging PlataPay agent, kailangan mo ng:\n1. Valid government ID\n2. Proof of address\n3. Angkop na business location\n4. Initial investment para sa iyong napiling plan\n5. Smartphone o computer na may internet access\n\nAng lahat ng mga requirements na ito ay tumutulong na matiyak na makapagbibigay ka ng maaasahang serbisyo sa mga customer."
  }

  if (q.includes("benefits") || q.includes("advantage") || q.includes("benepisyo")) {
    return "Ang mga benepisyo ng pagiging PlataPay agent ay kinabibilangan ng:\n• Karagdagang kita sa pamamagitan ng transaction commissions\n• Pagtaas ng foot traffic sa iyong existing business\n• Mababang startup costs kumpara sa ibang negosyo\n• Flexible working hours\n• Support mula sa marketing at technical teams ng PlataPay\n• Pagkakataong magbigay ng mahahalagang serbisyo sa iyong komunidad"
  }

  if (q.includes("contact") || q.includes("support") || q.includes("help") || q.includes("tulong")) {
    return "Kung kailangan mo ng karagdagang support, maaari mong kontakin ang PlataPay sa pamamagitan ng:\n• Email: support@platapay.ph\n• Hotline: (02) 8123-4567\n• Facebook: facebook.com/platapayph\n\nAng customer support ay available Lunes hanggang Sabado, 8:00 AM hanggang 8:00 PM."
  }

  // Default response if no specific answer is found
  return "Pasensya na, wala akong tiyak na impormasyon tungkol diyan, pero maaari akong tumulong sa mga katanungan tungkol sa PlataPay application process, requirements, o kung paano sagutan ang form na ito. Mayroon ka bang ibang gusto malaman tungkol sa pagiging PlataPay agent?"
}
