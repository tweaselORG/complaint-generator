#import "style.typ": tweaselStyle
#show: tweaselStyle

#text(weight: 700, 1.75em)[Data protection violations in {{ analysisMeta.platform }} app "{{ analysisMeta.appName }}"]

= Introduction

I am a user of your {{ analysisMeta.platform }} app "{{ analysisMeta.appName }}"{{ '#footnote[#link("https://play.google.com/store/apps/details?id=tld.sample.app")]' if analysisMeta.appUrl }} (henceforth: "the app").

Through an automated analysis of the app, I have unfortunately become aware that the app is performing tracking and similar data transmissions in violation of applicable data protection law.

With this notice, I am making you aware of these violations and giving you the opportunity to remedy them.

= Findings

I have recorded {{ trackHarResult.length }} requests that transmitted data to {{ findings | length }} tracker(s) between {{ harEntries[0].startTime | dateFormat }} and {{ harEntries[harEntries.length - 1].startTime | dateFormat }}. These requests happened *without any interaction* with the app or any potential consent dialogs. See the attached technical report for further details.

{% for adapterSlug, adapterResult in findings %}
== {{ adapterSlug }} (TODO: nicer title)

The app sent {{ adapterResult.requests.length }} request(s) to the tracker "{{ adapterSlug }}" (TODO: nicer title) (TODO: tracker URL), operated by "{{ adapterResult.adapter.tracker.name }}". Through these requests, at least the following information was transmitted:

#table(
  columns: (auto, auto),

  [*Data type*], [*Transmitted value(s)*],
  {% for property, value in adapterResult.receivedData -%}
  [{{ t("data-path-property-" + property.toLowerCase()) }}], [{{ value | join(', ') | code }}],
  {% endfor %}
)
{% endfor %}

= Legal assessment

By transmitting the information detailed above, you have violated the GDPR and ePrivacy Directive.

As the information includes unique identifiers that allow for the identification of the app's users, it constitutes personal data under Art. 4(1) GDPR and falls under the scope of the GDPR.

According to Art. 6(1) GDPR, the processing of personal data is only lawful if it is covered by one of six possible legal bases. None of the legal bases is applicable to the processing that you have performed.

The data protection authorities have repeatedly published guidance advising that consent is the only legal basis that can typically be used for tracking.#footnote[cf. e.g. https://edpb.europa.eu/sites/default/files/files/file1/edpb_guidelines-art_6-1-b-adopted_after_public_consultation_en.pdf, https://www.datenschutzkonferenz-online.de/media/oh/20221130_OH_Telemedien_2021_Version_1_1.pdf, https://www.baden-wuerttemberg.datenschutz.de/wp-content/uploads/2022/03/FAQ-Tracking-online.pdf]

However, consent can only be given by a statement or by a clear affirmative action (Art. 4(11) GDPR). Recital 32 GDPR clarifies that silence, pre-ticked boxes or inactivity do not constitute consent.

As explained, the transmissions detailed above happened without any interaction whatsoever. Thus, consent cannot possibly have been given for them.

Processing that can only rely on consent as a legal basis may only happen after consent has been given, and you, as the controller, need to be able to demonstrate that consent has been given (Art. 7(1) GDPR).

In addition, you have violated other provisions of the GDPR. In particular, Art. 5(1)(c) GDPR mandates the principle of data minimisation, requiring you to only process data to the extent necessary for the particular purpose. Further, Art. 25(1) GDPR prescribes the principle of data protection by design and by default.

Finally, you have violated Art. 5(3) ePrivacy Directive. Unlike the GDPR, Art. 5(3) ePD doesn't just cover personal data but any data that is read from or stored on a user's device.

Also unlike the GDPR, Art. 5(3) ePD does not provide multiple possible legal bases that could apply. It mandates that the storing of information, or the gaining of access to information already stored in the terminal equipment of a user is only allowed if the user has given their consent.

The two possible exceptions to this clause have to be interpreted narrowly, with tracking and advertising not being strictly necessary according to the Article 29 Working Party.#footnote[https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf]

Art. 5(3) ePD defers to the GDPR for conditions on consent. As such, the same reasoning applies here as well. You have not received consent under Art. 5(3) ePD, either.

= Complaint

Given the above, I conclude that you have violated my data protection rights as a user of the app. Art. 77 GDPR gives me the right to lodge a complaint with the data protection authorities in such cases.

The data protection authorities have investigative and corrective powers according to Art. 58 GDPR. In particular, they can issue fines of up to 20~Million~EUR or 4~% of your total worldwide annual turnover, whichever is higher, against you for violations according to Art. 83(5) GDPR.

However, in the interest of avoiding unneccesary work for you, the data protection authorities, and myself, I am giving you a voluntary grace period of 60 days from the date of this notice. If you remedy the violations detailed herein and ensure that the app is fully compliant with the GDPR and ePrivacy Directive within this period, I plan to refrain from filing a complaint against you in this matter.
