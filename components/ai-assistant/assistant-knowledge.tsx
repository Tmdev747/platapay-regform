// This file contains the knowledge base for the AI assistant

export function getInitialMessage(): string {
  return "Magandang araw po! Ako po si MARIA, ang inyong friendly AI Agent mula sa PlataPay. Ako ay nandito para tulungan kayo sa inyong PlataPay Agent application form. Maaari ninyo akong tanungin tungkol sa anumang bahagi ng form o kung paano sagutan ito nang tama. Paano ko po kayo matutulungan ngayong araw?"
}

export function getSuggestions(currentStep: number): string[] {
  const commonQuestions = [
    "Ano ang PlataPay?",
    "Gaano katagal bago ma-approve?",
    "Ano ang mga requirements?",
    "Paano kumita bilang PlataPay agent?",
  ]

  const stepSpecificSuggestions: Record<number, string[]> = {
    0: [
      "Anong mga ID ang tinatanggap?",
      "Bakit kailangan ang personal information ko?",
      "Secure ba ang data ko?",
      "Ano ang gagawin sa TIN number ko?",
    ],
    1: [
      "Kailangan ba ng business experience?",
      "Paano kung wala akong business experience?",
      "Pwede bang idagdag ang PlataPay sa existing business ko?",
      "Ano ang mga advantages ng may existing business?",
    ],
    2: [
      "Paano ko mahahanap ang location coordinates ko?",
      "Bakit kailangan ang exact location?",
      "Pwede bang mag-operate sa multiple locations?",
      "Ano ang ideal na business location?",
    ],
    3: [
      "Anong plan ang pinakamainam para sa beginners?",
      "Ano ang mga commission rates?",
      "Pwede bang mag-upgrade ng plan later?",
      "Ano ang kaibahan ng Enterprise sa regular plans?",
    ],
    4: [
      "Anong mga dokumento ang kailangan kong ihanda?",
      "Anong format dapat ang files ko?",
      "Paano kung wala akong business permit?",
      "Kailangan ba ng notarized documents?",
    ],
    5: [
      "Sino ang nag-rereview ng application ko?",
      "Ano ang mangyayari pagkatapos ng assessment?",
      "Gaano katagal ang assessment process?",
      "Paano kung ma-reject ang application ko?",
    ],
    6: [
      "Ano ang mangyayari pagkatapos ng activation?",
      "Paano ko gagamitin ang system?",
      "Kailan ako makakatanggap ng training?",
      "Paano ang pag-withdraw ng earnings?",
    ],
  }

  return [...(stepSpecificSuggestions[currentStep] || []), ...commonQuestions].slice(0, 4)
}

export function getResponseForQuery(query: string, currentStep: number): string {
  // Convert query to lowercase for easier matching
  const q = query.toLowerCase()

  // General PlataPay information
  if (q.includes("ano ang platapay") || q.includes("about platapay") || q.includes("what is platapay")) {
    return "Ang PlataPay ay isang nangungunang financial technology company sa Pilipinas na nagbibigay ng digital payment solutions. Bilang isang PlataPay agent, makakapag-alok ka ng mga serbisyo tulad ng bills payment, e-loading, remittance, at iba pang financial transactions sa mga customer sa iyong lugar. Ang PlataPay ay naglalayong gawing mas accessible ang financial services sa mga Pilipino, lalo na sa mga lugar na limitado ang access sa traditional banking."
  }

  if (
    q.includes("gaano katagal") &&
    (q.includes("approval") || q.includes("process") || q.includes("take") || q.includes("bago ma-approve"))
  ) {
    return "Ang application process ay karaniwang tumatagal ng 5-7 business days mula sa submission hanggang approval, kung kumpleto at na-verify na ang lahat ng iyong dokumento. Makakatanggap ka ng updates sa pamamagitan ng email tungkol sa status ng iyong application. Ang proseso ay kinabibilangan ng verification ng iyong identity, background check, at assessment ng proposed business location mo."
  }

  if (q.includes("commission") || q.includes("earn") || q.includes("income") || q.includes("kita")) {
    return "Ang mga commission rates ay nag-iiba batay sa iyong napiling plan at uri ng transaction. Ang Basic plans ay nagsisimula sa commission na 50-70% ng service fee, habang ang Premium plans ay nag-aalok ng hanggang 80-90%. Mas maraming transactions ang iyong ma-process, mas mataas ang potential earnings mo. Halimbawa, para sa bills payment, ang commission ay ₱5-10 per transaction, sa e-loading naman ay 3-5% ng load amount, at sa remittance ay 0.5-1% ng amount na pinadala."
  }

  if (q.includes("purpose") || q.includes("para saan") || q.includes("bakit kailangan") || q.includes("layunin")) {
    return "Ang PlataPay Agent Application Form na ito ay ginawa para sa mga indibidwal o negosyante na gustong maging opisyal na PlataPay agent. Bilang isang PlataPay agent, magkakaroon ka ng kakayahang mag-alok ng iba't ibang digital financial services sa iyong komunidad, tulad ng bills payment, e-loading, remittance, at iba pa. Ang form na ito ay kumakalap ng mahahalagang impormasyon para masuri ng PlataPay kung angkop ka bilang business partner at para makapagbigay ng tamang support at resources para sa iyong tagumpay."
  }

  if (q.includes("requirements") || q.includes("kailangan")) {
    return "Para maging PlataPay agent, kailangan mo ng:\n1. Valid government ID (front at back)\n2. Selfie na hawak ang ID\n3. Proof of address (utility bill na hindi lalagpas sa 3 buwan)\n4. Angkop na business location\n5. Initial investment para sa iyong napiling plan (₱499 para sa Basic, ₱999 para sa Plus, ₱1,499 para sa Premium)\n6. Smartphone o computer na may internet access\n7. TIN Number (kung meron)\n8. Business permit (kung may existing business)\n\nAng lahat ng mga requirements na ito ay tumutulong na matiyak na makapagbibigay ka ng maaasahang serbisyo sa mga customer."
  }

  if (q.includes("benefits") || q.includes("advantage") || q.includes("benepisyo")) {
    return "Ang mga benepisyo ng pagiging PlataPay agent ay kinabibilangan ng:\n• Karagdagang kita sa pamamagitan ng transaction commissions (50-90% depende sa plan)\n• Pagtaas ng foot traffic sa iyong existing business\n• Mababang startup costs kumpara sa ibang negosyo\n• Flexible working hours\n• Support mula sa marketing at technical teams ng PlataPay\n• Regular training at product updates\n• Access sa exclusive agent portal\n• Pagkakataong magbigay ng mahahalagang serbisyo sa iyong komunidad\n• Potential na maging financial hub sa iyong lugar"
  }

  // Step-specific responses
  if (currentStep === 0) {
    // Personal Information
    if ((q.includes("id") && q.includes("accept")) || q.includes("tinatanggap")) {
      return "Ang PlataPay ay tumatanggap ng iba't ibang government-issued IDs kabilang ang: Passport, Driver's License, SSS ID, GSIS ID, PhilHealth ID, Voter's ID, Postal ID, at National ID. Siguraduhin na valid at hindi expired ang iyong ID. Ang ID ay gagamitin para sa KYC (Know Your Customer) process na required ng BSP para sa lahat ng financial service providers."
    }

    if (q.includes("bakit") && q.includes("personal information")) {
      return "Ang iyong personal information ay kinakailangan para sa KYC (Know Your Customer) compliance, na inuutos ng Bangko Sentral ng Pilipinas (BSP) para sa mga financial service providers. Ito ay tumutulong na maiwasan ang fraud at tinitiyak ang seguridad ng mga financial transactions. Ang mga detalye tulad ng iyong pangalan, contact information, at ID ay ginagamit para i-verify ang iyong identity at para matiyak na legitimate ang iyong application. Ang mga impormasyong ito ay mahalagang bahagi ng regulatory compliance at risk management ng PlataPay."
    }

    if (q.includes("data") && (q.includes("secure") || q.includes("ligtas"))) {
      return "Oo, ang iyong data ay secure. Ang PlataPay ay nagpapatupad ng industry-standard security measures at sumusunod sa Data Privacy Act of 2012 (Republic Act 10173). Ang iyong impormasyon ay naka-encrypt at ginagamit lamang para sa mga layuning nakasaad sa aming privacy policy. May mga regular security audits at may dedicated data protection team ang PlataPay para matiyak na protektado ang lahat ng personal at financial information ng aming mga agents at customers."
    }

    if (q.includes("tin") && q.includes("number")) {
      return "Ang TIN (Tax Identification Number) ay hinihiling para sa tax reporting purposes. Bilang isang PlataPay agent, ikaw ay magiging isang business partner at ang iyong kita ay subject sa applicable taxes. Ang PlataPay ay required na mag-issue ng mga tax documents tulad ng Certificate of Income Payment Not Subject to Withholding (BIR Form 2304) para sa mga commissions na binabayad sa mga agents. Kung wala ka pang TIN, maaari ka pa ring mag-apply at tutulungan ka naming makakuha nito bilang bahagi ng onboarding process."
    }
  }

  if (currentStep === 1) {
    // Business Experience
    if (q.includes("kailangan") && q.includes("business experience")) {
      return "Hindi, hindi mahigpit na kinakailangan ang nakaraang business experience para maging PlataPay agent. Gayunpaman, ang pagkakaroon ng ilang business background ay makakatulong. Ang PlataPay ay nagbibigay ng comprehensive training at support para tulungan ang mga bagong agents na magtagumpay, kahit na ito ang iyong unang business venture. Ang mga mahahalagang katangian ay dedication, willingness to learn, at good customer service skills."
    }

    if (q.includes("wala") && q.includes("business experience")) {
      return "Okay lang yan! Maraming matagumpay na PlataPay agents ang nagsimula nang walang nakaraang business experience. Ang mga pangunahing requirements ay dedikasyon, magandang lokasyon, at kahandaang matuto. Ang PlataPay ay nagbibigay ng training materials, marketing support, at technical assistance para tulungan kang magsimula. May dedicated agent support team din na handang sumagot sa iyong mga katanungan at gabayan ka sa iyong journey bilang PlataPay agent."
    }

    if (q.includes("idagdag") && q.includes("existing business")) {
      return "Oo, maaari mong idagdag ang mga serbisyo ng PlataPay sa iyong existing business! Ito ay isang magandang paraan para dagdagan ang foot traffic at magdagdag ng karagdagang revenue stream. Maraming sari-sari stores, internet cafes, loading stations, at iba pang maliliit na negosyo ang matagumpay na nag-integrate ng mga serbisyo ng PlataPay. Ang mga existing businesses ay may advantage dahil may established location at customer base na, kaya mas madali ang pag-market ng bagong serbisyo."
    }

    if (q.includes("advantages") && q.includes("existing business")) {
      return "Ang mga advantages ng pag-integrate ng PlataPay sa existing business ay:\n1. Instant customer base - Ang mga existing customers mo ay potential users ng PlataPay services\n2. Shared overhead costs - Hindi mo na kailangang magbayad ng hiwalay na renta, utilities, atbp.\n3. Complementary services - Ang PlataPay services ay karaniwang complementary sa maraming businesses tulad ng retail stores\n4. Increased foot traffic - Ang mga taong pumupunta para sa PlataPay services ay maaaring bumili rin ng iyong ibang produkto\n5. Established credibility - Mas madaling pagkatiwalaan ng mga customer ang PlataPay services kung ito ay offered ng isang kilala nang negosyo sa lugar"
    }
  }

  if (currentStep === 2) {
    // Business Location
    if (
      q.includes("location coordinates") ||
      q.includes("find my location") ||
      (q.includes("hanap") && q.includes("location"))
    ) {
      return "Makukuha mo ang iyong location coordinates sa pamamagitan ng pag-click sa 'Get My Location' button, na gagamit ng GPS ng iyong device. Kung hindi ito gumagana, maaari mong gamitin ang mapa para manu-manong ilagay ang marker sa iyong business location. Ang mga tumpak na coordinates ay tumutulong sa PlataPay na masuri ang strategic value ng iyong lokasyon at para sa territory mapping upang maiwasan ang oversaturation ng agents sa isang lugar."
    }

    if (q.includes("bakit") && q.includes("exact location")) {
      return "Ang exact location ay mahalaga para sa ilang mga dahilan:\n1. Territory Management - Para maiwasan ang oversaturation ng agents sa isang lugar\n2. Market Analysis - Para masuri ang potential customer base sa iyong area\n3. Logistics - Para sa efficient delivery ng marketing materials at supplies\n4. Customer Mapping - Para madaling mahanap ng customers ang pinakamalapit na PlataPay agent\n5. Business Planning - Para matulungan ka sa strategic planning at marketing\n\nAng PlataPay ay gumagamit ng geospatial analytics para matiyak na ang mga agents ay strategically located para maximum success."
    }

    if (q.includes("multiple locations") || q.includes("maraming location")) {
      return "Sa simula, ang bawat application ay para sa isang business location lamang. Gayunpaman, kapag ikaw ay naging established PlataPay agent na, maaari kang mag-apply para sa karagdagang mga lokasyon sa ilalim ng parehong account. Ang bawat lokasyon ay kailangang dumaan sa sarili nitong approval process at kailangang may sariling dedicated staff. May special multi-branch program ang PlataPay para sa mga successful agents na gustong mag-expand sa multiple locations, na may additional benefits at incentives."
    }

    if (q.includes("ideal") && q.includes("location")) {
      return "Ang ideal na business location para sa isang PlataPay agent ay:\n1. High foot traffic area (malapit sa palengke, eskwelahan, opisina, atbp.)\n2. Accessible sa public transportation\n3. Visible at madaling makita mula sa kalsada\n4. May sapat na seguridad para sa cash handling\n5. May stable internet connection\n6. Hindi masyadong malapit sa ibang existing PlataPay agents (ideally 300-500 meters ang layo)\n7. May sapat na espasyo para sa signage at branding materials\n\nAng mga lokasyon sa commercial areas, residential communities, at transportation hubs ay kadalasang successful."
    }
  }

  if (currentStep === 3) {
    // Business Packages
    if ((q.includes("best") || q.includes("pinakamainam")) && q.includes("beginner")) {
      return "Para sa mga beginners, ang Basic Plan (₱499) ay kadalasang ang pinakamainam na pagpipilian para magsimula. Ito ay may mas mababang initial investment ngunit nagbibigay pa rin ng lahat ng essential services. Kasama sa Basic Plan ang:\n• ₱499 initial transaction fund\n• Standard commission rates (50-70%)\n• Basic marketing materials\n• Access sa agent portal\n• Standard customer support\n\nHabang lumalaki ang iyong transaction volume, maaari mong isaalang-alang ang pag-upgrade sa Plus o Premium plans para sa mas mataas na commission rates at karagdagang benefits."
    }

    if ((q.includes("upgrade") && q.includes("later")) || (q.includes("upgrade") && q.includes("mamaya"))) {
      return "Oo, maaari kang mag-upgrade ng plan anumang oras pagkatapos maging active agent. Maraming agents ang nagsisimula sa Basic Plan at nag-upgrade habang lumalaki ang kanilang negosyo. Ang mga plan upgrades ay maaaring hilingin sa pamamagitan ng iyong agent portal at karaniwang may bisa sa loob ng 1-2 business days. Ang pag-upgrade ay nangangailangan lamang ng pagbabayad ng difference sa pagitan ng iyong current plan at ng bagong plan na gusto mo. Hindi na kailangan ng bagong application process."
    }

    if (q.includes("enterprise") && (q.includes("difference") || q.includes("kaibahan"))) {
      return "Ang Enterprise Plans ay designed para sa mas malalaking negosyo o para sa mga gustong mag-operate ng multiple PlataPay branches. Ang mga kaibahan ng Enterprise Plans sa regular plans ay:\n\n• Customizable commission structure\n• Dedicated account manager\n• Priority technical support\n• Advanced reporting at analytics tools\n• Customized branding options\n• Higher transaction limits\n• Access sa exclusive Enterprise agent events at trainings\n• Ability to manage multiple locations under one account\n\nAng Enterprise Deluxe Plan ay may additional benefits tulad ng white-labeled app at priority processing ng settlements."
    }

    if (q.includes("commission") && q.includes("rates")) {
      return "Ang commission rates ay nag-iiba depende sa plan at service type:\n\nBasic Plan (₱499):\n• Bills Payment: ₱5 per transaction\n• E-loading: 3% ng load amount\n• Remittance: 0.5% ng amount\n\nPlus Plan (₱999):\n• Bills Payment: ₱7 per transaction\n• E-loading: 4% ng load amount\n• Remittance: 0.7% ng amount\n\nPremium Plan (₱1,499):\n• Bills Payment: ₱10 per transaction\n• E-loading: 5% ng load amount\n• Remittance: 1% ng amount\n\nEnterprise Plans ay may customized rates based sa expected transaction volume. Lahat ng agents ay eligible din para sa monthly incentives at bonuses kapag naabot ang certain transaction targets."
    }
  }

  if (currentStep === 4) {
    // Requirements & Signature
    if (q.includes("dokumento") && (q.includes("kailangan") || q.includes("ihanda"))) {
      return "Ang mahahalagang dokumento na kailangan mong ihanda ay:\n1. Valid government-issued ID (harap at likod) - Passport, Driver's License, SSS, GSIS, PhilHealth, Voter's ID, Postal ID, o National ID\n2. Selfie kasama ang iyong ID - Malinaw na kuha na hawak mo ang ID mo\n3. Proof of address (utility bill na hindi lalagpas sa 3 buwan) - Electricity, water, internet, o cable bill na nakapangalan sa iyo\n4. Signature - Digital signature o scanned copy ng iyong signature\n\nKung mayroon kang existing business, dapat mo ring isama ang iyong business permit. Ang lahat ng dokumento ay dapat malinaw, nababasa, at nasa JPG, PNG, o PDF format na hindi lalagpas sa 5MB ang file size."
    }

    if (q.includes("format") && q.includes("file")) {
      return "Maaari mong i-upload ang iyong mga dokumento sa JPG, PNG, o PDF format. Ang bawat file ay hindi dapat lumampas sa 5MB. Siguraduhin na malinaw ang mga larawan at nababasa ang lahat ng text. Para sa mga ID at selfie, mas mainam ang JPG o PNG format. Para sa mga dokumento tulad ng business permit o proof of address, mas mainam ang PDF format para mapanatili ang quality. Kung ang file mo ay masyadong malaki, maaari mong gamitin ang mga online tools para i-compress ito bago i-upload."
    }

    if (q.includes("wala") && q.includes("business permit")) {
      return "Kung wala ka pang business permit, maaari ka pa ring mag-apply bilang individual agent. Gayunpaman, inirerekomenda namin ang pagkuha ng tamang business registration para sa iyong PlataPay agency. Maaari kang mag-apply ng business permit sa iyong local municipal o city hall. Ang PlataPay ay maaaring magbigay ng certification letter para suportahan ang iyong business permit application kung kinakailangan. Para sa mga bagong agents, binibigyan namin ng 3-month grace period para makakuha ng business permit habang operational na ang iyong PlataPay services."
    }

    if (q.includes("notarized") || q.includes("notaryo")) {
      return "Hindi kinakailangan ng notarized documents para sa initial application. Ang digital signature mo sa online form ay sapat na. Gayunpaman, pagkatapos ng approval, may ilang dokumento tulad ng Agent Agreement na maaaring kailanganin ng notarization bago ang final activation. Ang PlataPay ay magbibigay ng mga detalyadong instructions tungkol dito pagkatapos ng initial approval. Para sa ngayon, ang iyong digital signature sa application form ay sapat na para iproseso ang iyong application."
    }
  }

  if (currentStep === 5) {
    // Assessment
    if (q.includes("sino") && q.includes("review")) {
      return "Ang iyong application ay rereviewhin ng PlataPay Agent Acquisition Team, na binubuo ng mga specialists sa business development, compliance, at risk management. Ang team na ito ay sumusuri sa lahat ng aspects ng iyong application, kabilang ang iyong personal information, business experience, location analysis, at submitted documents. Sa ilang kaso, maaaring may representative mula sa PlataPay na bibisita sa iyong proposed location para i-verify ang details at i-assess ang suitability nito."
    }

    if (q.includes("mangyayari") && q.includes("assessment")) {
      return "Pagkatapos ng assessment, maaaring mangyari ang isa sa mga sumusunod:\n\n1. Approval - Kung approved ang iyong application, makakatanggap ka ng email notification at instructions para sa next steps, kasama ang agent onboarding schedule at system activation details.\n\n2. Additional Requirements - Kung kailangan ng karagdagang information o documents, makakatanggap ka ng specific request at mabibigyan ng time para i-submit ang mga ito.\n\n3. Conditional Approval - Minsan, ang application ay approved pero may certain conditions na kailangang matugunan bago ang full activation.\n\n4. Rejection - Kung hindi approved ang application, makakatanggap ka ng notification na may explanation at maaari kang mag-apply ulit after 3 months."
    }

    if (q.includes("gaano katagal") && q.includes("assessment")) {
      return "Ang assessment process ay karaniwang tumatagal ng 3-5 business days mula sa submission ng complete application. Gayunpaman, maaaring tumagal ito ng hanggang 7 business days sa peak seasons o kung kailangan ng additional verification. Makakatanggap ka ng regular updates sa email tungkol sa status ng iyong application. Kung may mga tanong o concerns ka habang hinihintay ang assessment results, maaari kang makipag-ugnayan sa PlataPay Agent Support sa pamamagitan ng email sa support@platapay.ph o sa hotline (02) 8123-4567."
    }

    if (q.includes("reject") || q.includes("hindi approved")) {
      return "Kung hindi ma-approve ang iyong application, makakatanggap ka ng detailed explanation kung bakit at mga rekomendasyon kung paano mo maaaring i-improve ang iyong application sa susunod. Ang mga karaniwang dahilan ng rejection ay:\n\n• Incomplete o inconsistent information\n• Failed background check\n• Oversaturated location (may masyadong maraming PlataPay agents sa area)\n• Insufficient documentation\n• Concerns about business viability\n\nMaaari kang mag-apply muli after 3 months, at ang PlataPay ay nagbibigay ng guidance para matulungan kang ma-address ang mga issues sa iyong previous application."
    }
  }

  if (currentStep === 6) {
    // System Activation
    if (q.includes("mangyayari") && q.includes("activation")) {
      return "Pagkatapos ng system activation, makakatanggap ka ng:\n\n1. Agent ID at credentials para sa PlataPay Agent Portal\n2. Welcome kit na may marketing materials at agent handbook\n3. Initial transaction fund (depende sa iyong plan)\n4. Access sa PlataPay Agent mobile app\n5. Schedule para sa orientation at training\n\nMatapos ang activation, bibigyan ka ng 24-48 hours para i-setup ang iyong system at i-test ang mga transactions. Pagkatapos nito, maaari ka nang magsimulang tumanggap ng actual customer transactions at kumita ng commissions."
    }

    if (q.includes("paano") && q.includes("system")) {
      return "Para gamitin ang PlataPay system:\n\n1. Download ang PlataPay Agent App mula sa Google Play Store o Apple App Store\n2. Log in gamit ang iyong agent credentials na ibibigay sa email\n3. Complete ang in-app tutorial at system walkthrough\n4. Connect ang iyong settlement account (bank account o e-wallet)\n5. Personalize ang iyong agent profile at settings\n6. Familiarize yourself sa dashboard at transaction processes\n\nAng system ay designed para maging user-friendly at may built-in help features. May 24/7 technical support din para tulungan ka kung may mga issues o questions ka tungkol sa paggamit ng system."
    }

    if (q.includes("training") || q.includes("pagsasanay")) {
      return "Makakatanggap ka ng comprehensive training pagkatapos ng activation:\n\n1. Initial Orientation (online) - Overview ng PlataPay, agent responsibilities, at basic system usage\n2. Technical Training (online o face-to-face) - Detailed walkthrough ng system, transaction processing, at troubleshooting\n3. Business Development Training - Tips para i-grow ang iyong PlataPay business at marketing strategies\n4. Regular Webinars - Ongoing training para sa new features at services\n\nAng initial training ay usually scheduled within 3-5 days after activation. Lahat ng training materials ay maa-access din sa Agent Portal para sa self-paced learning at reference."
    }

    if (q.includes("withdraw") || q.includes("earnings") || q.includes("kita")) {
      return "Para ma-withdraw ang iyong earnings:\n\n1. Log in sa PlataPay Agent Portal o App\n2. Navigate sa 'Earnings' o 'Wallet' section\n3. Select 'Withdraw Funds'\n4. Choose ang withdrawal method (bank transfer, e-wallet, o over-the-counter)\n5. Enter ang amount na gusto mong i-withdraw\n6. Confirm ang transaction\n\nAng commissions ay automatically credited sa iyong Agent Wallet daily. Ang minimum withdrawal amount ay ₱500, at ang processing time ay 1-2 banking days. Regular withdrawals (weekly) ay may zero processing fee, while same-day rush withdrawals ay may minimal fee."
    }
  }

  // Default responses based on keywords
  if (q.includes("contact") || q.includes("support") || q.includes("help") || q.includes("tulong")) {
    return "Kung kailangan mo ng karagdagang support, maaari mong kontakin ang PlataPay sa pamamagitan ng:\n• Email: support@platapay.ph\n• Hotline: (02) 8123-4567\n• Facebook: facebook.com/platapayph\n• Agent Support Portal: agents.platapay.ph\n\nAng customer support ay available Lunes hanggang Sabado, 8:00 AM hanggang 8:00 PM. Para sa urgent technical issues, may 24/7 emergency support line sa (02) 8765-4321. Maaari ka ring mag-schedule ng one-on-one consultation sa pamamagitan ng Agent Portal."
  }

  if (q.includes("application process") || q.includes("proseso")) {
    return "Ang buong application process para maging PlataPay agent ay may mga sumusunod na hakbang:\n\n1. Form Submission - Pagkumpleto at pag-submit ng online application form kasama ang required documents\n2. Initial Screening - Verification ng personal information at submitted documents (1-2 days)\n3. Background Check - Checking ng credit history at criminal records kung applicable (2-3 days)\n4. Location Assessment - Evaluation ng proposed business location (1-2 days)\n5. Final Review - Comprehensive assessment ng application (1-2 days)\n6. Approval Notification - Email confirmation ng approval\n7. Contract Signing - Pag-sign ng Agent Agreement\n8. Payment - Payment ng initial investment based sa selected plan\n9. System Activation - Setting up ng agent account at credentials\n10. Training - Orientation at technical training\n11. Launch - Official start ng operations\n\nAng kabuuang process ay karaniwang tumatagal ng 7-14 days mula submission hanggang activation."
  }

  if (q.includes("cancel") || q.includes("withdraw application") || q.includes("back out")) {
    return "Maaari mong i-cancel ang iyong application anumang oras bago ang final approval at payment. Para gawin ito, mag-send lang ng email sa applications@platapay.ph na may subject line 'Application Cancellation - [Your Name]' at ilagay ang iyong application reference number. Kung nag-submit ka na ng payment para sa iyong chosen plan, may cancellation policy na susundin:\n\n• Cancellation before system activation: 90% refund\n• Cancellation within 7 days after activation: 50% refund\n• Cancellation after 7 days of activation: No refund\n\nTake note na ang refund processing ay tumatagal ng 7-14 banking days."
  }

  // Default response if no specific answer is found
  return "Pasensya na, wala akong tiyak na impormasyon tungkol diyan, pero maaari akong tumulong sa mga katanungan tungkol sa PlataPay application process, requirements, o kung paano sagutan ang form na ito. Mayroon ka bang ibang gusto malaman tungkol sa pagiging PlataPay agent? Maaari mo ring i-check ang FAQ section sa website ng PlataPay (www.platapay.ph/agent-faq) para sa karagdagang impormasyon."
}
