<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <title>{{ $subjectLine }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #202b40; line-height: 1.6;">
    <h1 style="font-size: 22px;">{{ __('New MoriHome contact message') }}</h1>
    <p><strong>{{ __('Name:') }}</strong> {{ $senderName }}</p>
    <p><strong>{{ __('Email:') }}</strong> {{ $senderEmail }}</p>
    <p><strong>{{ __('Phone:') }}</strong> {{ $senderPhone ?: __('Not provided') }}</p>
    <p><strong>{{ __('Subject:') }}</strong> {{ $subjectLine }}</p>
    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
    <p style="white-space: pre-wrap;">{{ $bodyText }}</p>
</body>
</html>
