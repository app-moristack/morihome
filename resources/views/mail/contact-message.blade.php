<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $subjectLine }}</title>
</head>
<body style="font-family: Arial, sans-serif; color: #202b40; line-height: 1.6;">
    <h1 style="font-size: 22px;">New MoriHome contact message</h1>
    <p><strong>Name:</strong> {{ $senderName }}</p>
    <p><strong>Email:</strong> {{ $senderEmail }}</p>
    <p><strong>Phone:</strong> {{ $senderPhone ?: 'Not provided' }}</p>
    <p><strong>Subject:</strong> {{ $subjectLine }}</p>
    <hr style="border: 0; border-top: 1px solid #e5e7eb;">
    <p style="white-space: pre-wrap;">{{ $bodyText }}</p>
</body>
</html>
