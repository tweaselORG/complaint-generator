#import "style.typ": tweaselStyle
#show: tweaselStyle

#text(weight: 700, 1.75em)[Technical report: Analysis of {{ analysisMeta.platform }} app "{{ analysisMeta.appName }}"]

= Introduction

This report details the findings and methodology of an automated analysis concerning tracking and similar data transmissions performed on the {{ analysisMeta.platform }} app "{{ analysisMeta.appName }}"{{ '#footnote[#link("https://play.google.com/store/apps/details?id=tld.sample.app")]' if analysisMeta.appUrl }} (henceforth: "the app") through the Tweasel project, operated by Datenanfragen.de e. V.

The analysis was performed on {{ analysisMeta.analysisDate | dateFormat }} on version {{ analysisMeta.appVersion }} of the app on {{ analysisMeta.platform }} {{ analysisMeta.analysisPlatformVersion }}.

= Findings

During the analysis, the network traffic initiated by the app was recorded. In total, {{ harEntries.length }} requests were recorded between {{ harEntries[0].startTime | dateFormat }} and {{ harEntries[harEntries.length - 1].startTime | dateFormat }}. The recorded traffic is attached as a HAR file{% if analysisMeta.harMd5 %} (MD5 checksum of the HAR file: {{ analysisMeta.harMd5 | code }}){% endif %}, a standard format used by HTTP(S) monitoring tools to export collected data.#footnote[#link("http://www.softwareishard.com/blog/har-12-spec/")] HAR files can be viewed using Firefox or Chrome, for example.#footnote[TODO: https://github.com/tweaselORG/docs.tweasel.org/issues/7] The contents of the recorded traffic are also reproduced in @har2pdf[Appendix]

== Network traffic without any interaction

The requests described in this sections happened *without any interaction* with the app or any potential consent dialogs.

In total, there were {{ trackHarResult.length }} requests detected that transmitted data to {{ findings | length }} trackers without any interaction.

{% for adapterSlug, adapterResult in findings %}
=== {{ adapterSlug }} (TODO: nicer title)

The app sent the following {{ adapterResult.requests.length }} requests to the tracker "{{ adapterSlug }}" (TODO: nicer title) (TODO: tracker URL), operated by "{{ adapterResult.adapter.tracker.name }}". For details on how the requests to this tracker were decoded and the reasoning for how the transmitted information was determined, see the documentation in the Tweasel Tracker Wiki#footnote[The documentation for "{{ adapterSlug }}" (TODO: nicer title) is available at: #link("https://trackers.tweasel.org/t/{{ adapterSlug | safe }}")].

{% for request in adapterResult.requests %}
{% set harEntry = harEntries[request.harIndex] %}
==== {{ harEntry.request.method | code }} request to {{ harEntry.request.host | code }} ({{ harEntry.startTime | timeFormat }})

On {{ harEntry.startTime | dateFormat }}, the app sent a {{ harEntry.request.method | code }} request to {{ harEntry.request.host | code }}. This request is reproduced in @har2pdf-e{{ request.harIndex | safe }}[Appendix].

The following information was detected as being transmitted through this request:

{% for transmission in request.transmissions -%}
+ {{ t("data-path-property-" + transmission.property.toLowerCase()) }} (transmitted as {{ transmission.path | code }} with the value {{ transmission.value | code }})
{% endfor %}
{% endfor %}
{% endfor %}

= Method

TODO

// Appendix
#pagebreak()

#counter(heading).update(0)
#set heading(numbering: (..nums) => "A" + nums.pos().map(str).join(".") + ".")

#text(weight: 700, 1.75em)[Appendix]

= Recorded traffic <har2pdf>

Below is a reproduction of the recorded network requests that are mentioned in the report as documented in the attached HAR file. Only requests are shown, all responses are omitted. Binary request content is represented as a hexdump. Request content longer than 4,096 bytes is truncated. The full recorded traffic with all requests and including responses and full request content can be seen the in attached HAR file.

#include "har.typ"
