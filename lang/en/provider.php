<?php

return [
    'type' => [
        'individual' => 'Individual worker',
        'agency' => 'Agency',
        'business' => 'Business',
    ],

    'status' => [
        'draft' => 'Draft',
        'pending' => 'Pending validation',
        'approved' => 'Approved',
        'rejected' => 'Rejected',
        'suspended' => 'Suspended',
    ],

    'cannot_submit' => 'This profile cannot be submitted for review in its current state.',
    'incomplete_profile' => 'Complete your profile before submitting it: :fields.',
    'unknown_service_category' => 'One or more selected service categories are unavailable.',
    'portfolio_limit' => 'You can upload at most :limit portfolio images.',
    'not_found' => 'This provider is not available.',
];
