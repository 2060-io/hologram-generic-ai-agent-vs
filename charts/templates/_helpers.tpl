{{- define "chatbot.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "chatbot.fullname" -}}
{{- printf "%s" .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "chatbot.labels" -}}
helm.sh/chart: {{ include "chatbot.name" . }}-{{ .Chart.Version | replace "+" "_" }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "chatbot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chatbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
