{{- define "chatbot.name" -}}
{{- default .Chart.Name .Values.agentNameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "chatbot.fullname" -}}
{{- if .Values.agentNameOverride -}}
{{- .Values.agentNameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s" .Chart.Name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "chatbot.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ include "chatbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{- define "chatbot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "chatbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}
