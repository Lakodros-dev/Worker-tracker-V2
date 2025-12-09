// Mock data for development/demo mode

export const MOCK_MODE = false; // Set to true for demo mode

export const mockUsers = {
    admin: {
        id: "admin123",
        telegram_id: 6181098940,
        username: "admin_user",
        full_name: "Admin Adminov",
        is_approved: true,
        is_active: true,
        is_admin: true,
        work_start_hour: 9,
        work_end_hour: 18,
        created_at: "2024-01-01T09:00:00Z"
    },
    employee: {
        id: "emp456",
        telegram_id: 123456789,
        username: "hodim1",
        full_name: "Alisher Karimov",
        is_approved: true,
        is_active: true,
        is_admin: false,
        work_start_hour: 9,
        work_end_hour: 18,
        created_at: "2024-01-15T09:00:00Z"
    }
};

export const mockPendingUsers = [
    {
        id: "pending1",
        telegram_id: 111111111,
        username: "yangi_hodim1",
        full_name: "Bobur Toshmatov",
        is_approved: false,
        is_active: true,
        is_admin: false,
        work_start_hour: 9,
        work_end_hour: 18,
        created_at: "2024-12-07T10:30:00Z"
    },
    {
        id: "pending2",
        telegram_id: 222222222,
        username: "yangi_hodim2",
        full_name: "Dilnoza Rahimova",
        is_approved: false,
        is_active: true,
        is_admin: false,
        work_start_hour: 9,
        work_end_hour: 18,
        created_at: "2024-12-08T08:15:00Z"
    }
];

export const mockApprovedUsers = [
    {
        id: "emp456",
        telegram_id: 123456789,
        username: "hodim1",
        full_name: "Alisher Karimov",
        is_approved: true,
        is_active: true,
        is_admin: false,
        work_start_hour: 9,
        work_end_hour: 18,
        created_at: "2024-01-15T09:00:00Z"
    },
    {
        id: "emp789",
        telegram_id: 987654321,
        username: "hodim2",
        full_name: "Malika Saidova",
        is_approved: true,
        is_active: true,
        is_admin: false,
        work_start_hour: 8,
        work_end_hour: 17,
        created_at: "2024-02-01T09:00:00Z"
    },
    {
        id: "emp101",
        telegram_id: 555555555,
        username: "hodim3",
        full_name: "Jasur Yuldashev",
        is_approved: true,
        is_active: true,
        is_admin: false,
        work_start_hour: 10,
        work_end_hour: 19,
        created_at: "2024-03-10T09:00:00Z"
    }
];

export const mockTodayLocations = [
    { id: "loc1", latitude: 41.311081, longitude: 69.240562, distance: 15, is_valid: true, timestamp: "2024-12-08T09:05:00Z" },
    { id: "loc2", latitude: 41.311090, longitude: 69.240570, distance: 12, is_valid: true, timestamp: "2024-12-08T09:35:00Z" },
    { id: "loc3", latitude: 41.311075, longitude: 69.240555, distance: 18, is_valid: true, timestamp: "2024-12-08T10:05:00Z" },
    { id: "loc4", latitude: 41.315000, longitude: 69.245000, distance: 520, is_valid: false, timestamp: "2024-12-08T10:35:00Z" },
    { id: "loc5", latitude: 41.311085, longitude: 69.240560, distance: 10, is_valid: true, timestamp: "2024-12-08T11:05:00Z" },
];

export const mockTodayStatus = {
    date: new Date().toISOString().split('T')[0],
    locations_count: 5,
    valid_locations: 4,
    is_currently_in_office: true,
    first_location_time: "2024-12-08T09:05:00Z",
    last_location_time: "2024-12-08T11:05:00Z",
    work_start_hour: 9,
    work_end_hour: 18
};

export const mockDailyReport = {
    date: new Date().toISOString().split('T')[0],
    work_start_time: "2024-12-08T09:05:00Z",
    work_end_time: null,
    total_work_hours: 9,
    present_hours: 7.5,
    absent_hours: 1.5,
    total_locations: 15,
    valid_locations: 12,
    late_minutes: 5
};

export const mockMonthlyReport = {
    start_date: "2024-12-01",
    end_date: "2024-12-08",
    total_days: 6,
    total_work_hours: 54,
    total_present_hours: 48,
    total_absent_hours: 6,
    efficiency_percent: 88.9,
    daily_details: [
        { date: "2024-12-02", work_start_time: "2024-12-02T09:00:00Z", work_end_time: "2024-12-02T18:00:00Z", total_work_hours: 9, present_hours: 8.5, absent_hours: 0.5, total_locations: 18, valid_locations: 17, late_minutes: 0 },
        { date: "2024-12-03", work_start_time: "2024-12-03T09:10:00Z", work_end_time: "2024-12-03T18:00:00Z", total_work_hours: 9, present_hours: 8, absent_hours: 1, total_locations: 16, valid_locations: 14, late_minutes: 10 },
        { date: "2024-12-04", work_start_time: "2024-12-04T09:00:00Z", work_end_time: "2024-12-04T18:00:00Z", total_work_hours: 9, present_hours: 8.5, absent_hours: 0.5, total_locations: 18, valid_locations: 17, late_minutes: 0 },
        { date: "2024-12-05", work_start_time: "2024-12-05T09:05:00Z", work_end_time: "2024-12-05T18:00:00Z", total_work_hours: 9, present_hours: 7.5, absent_hours: 1.5, total_locations: 15, valid_locations: 12, late_minutes: 5 },
        { date: "2024-12-06", work_start_time: "2024-12-06T09:00:00Z", work_end_time: "2024-12-06T18:00:00Z", total_work_hours: 9, present_hours: 8, absent_hours: 1, total_locations: 17, valid_locations: 15, late_minutes: 0 },
        { date: "2024-12-08", work_start_time: "2024-12-08T09:05:00Z", work_end_time: null, total_work_hours: 9, present_hours: 7.5, absent_hours: 1.5, total_locations: 5, valid_locations: 4, late_minutes: 5 },
    ]
};

export const mockTodaySummary = {
    date: new Date().toISOString().split('T')[0],
    total_employees: 3,
    employees_with_data: 2,
    employees: [
        { user_id: "emp456", full_name: "Alisher Karimov", username: "hodim1", work_hours: "9:00 - 18:00", locations_count: 5, valid_locations: 4, present_hours: 7.5, late_minutes: 5, has_data: true },
        { user_id: "emp789", full_name: "Malika Saidova", username: "hodim2", work_hours: "8:00 - 17:00", locations_count: 8, valid_locations: 8, present_hours: 8, late_minutes: 0, has_data: true },
        { user_id: "emp101", full_name: "Jasur Yuldashev", username: "hodim3", work_hours: "10:00 - 19:00", locations_count: 0, valid_locations: 0, present_hours: 0, late_minutes: 0, has_data: false },
    ]
};

export const mockOfficeSettings = {
    use_area_mode: false,
    office_location: {
        latitude: 41.311081,
        longitude: 69.240562,
        radius: 100
    },
    office_area: null,
    location_interval_minutes: 30,
    grace_period_minutes: 5
};
