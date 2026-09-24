{{ __('New MoriHome contact message') }}

{{ __('Name:') }} {{ $senderName }}
{{ __('Email:') }} {{ $senderEmail }}
{{ __('Phone:') }} {{ $senderPhone ?: __('Not provided') }}
{{ __('Subject:') }} {{ $subjectLine }}

{{ $bodyText }}
