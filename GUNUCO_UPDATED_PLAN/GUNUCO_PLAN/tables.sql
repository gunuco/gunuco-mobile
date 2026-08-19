-- GUNUCO multi-location, multi-category ordering schema (SQL Server)
-- Launch configuration: one production-house location and Cakes only. Branches and additional categories are inactive but structurally supported.

CREATE TABLE ProductionHouse (
    ProductionHouseID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Address NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    ContactPhone NVARCHAR(20),
    Email NVARCHAR(100),
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),
    OperatingHours NVARCHAR(500),
    PickupInstructions NVARCHAR(1000),
    PickupAtStoreEnabled BIT NOT NULL DEFAULT 1,
    DoorstepDeliveryEnabled BIT NOT NULL DEFAULT 1,
    MaximumDoorstepDistanceKm DECIMAL(8,3) NOT NULL DEFAULT 15,
    ReturnWindowHours INT NOT NULL DEFAULT 24,
    TimeZoneID NVARCHAR(100) NOT NULL,
    AcceptOrders BIT NOT NULL DEFAULT 1,
    GlobalPOSEnabled BIT NOT NULL DEFAULT 1,
    CakesAcceptanceMode NVARCHAR(10) NOT NULL DEFAULT 'Automatic',
    PremiumAcceptanceMode NVARCHAR(10) NOT NULL DEFAULT 'Automatic',
    CustomCakesAcceptanceMode NVARCHAR(10) NOT NULL DEFAULT 'Manual',
    DailyOrderLimit INT,
    DeliveryAssignmentMode NVARCHAR(10) NOT NULL DEFAULT 'Automatic',
    DeliveryAssignmentTimeoutMinutes INT NOT NULL DEFAULT 2,
    FeedbackPromptDelayHours INT NOT NULL DEFAULT 24,
    FeedbackReminderDelayHours INT,
    FeedbackRequestExpiryHours INT NOT NULL DEFAULT 168,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_ProductionHouse_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT CK_ProductionHouse_CakesMode CHECK (CakesAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_PremiumMode CHECK (PremiumAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_CustomCakesMode CHECK (CustomCakesAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_DailyLimit CHECK (DailyOrderLimit IS NULL OR DailyOrderLimit > 0),
    CONSTRAINT CK_ProductionHouse_DeliveryMode CHECK (DeliveryAssignmentMode IN ('Automatic', 'Manual'))
    ,CONSTRAINT CK_ProductionHouse_AssignmentTimeout CHECK (DeliveryAssignmentTimeoutMinutes > 0)
    ,CONSTRAINT CK_ProductionHouse_Coordinates CHECK (
        (Latitude IS NULL AND Longitude IS NULL)
        OR (Latitude BETWEEN -90 AND 90 AND Longitude BETWEEN -180 AND 180)
    )
    ,CONSTRAINT CK_ProductionHouse_DeliveryDistance CHECK (MaximumDoorstepDistanceKm > 0)
    ,CONSTRAINT CK_ProductionHouse_ReturnWindow CHECK (ReturnWindowHours > 0)
    ,CONSTRAINT CK_ProductionHouse_FeedbackTiming CHECK (
        FeedbackPromptDelayHours >= 0
        AND (FeedbackReminderDelayHours IS NULL OR FeedbackReminderDelayHours > FeedbackPromptDelayHours)
        AND FeedbackRequestExpiryHours > ISNULL(FeedbackReminderDelayHours, FeedbackPromptDelayHours)
    )
);

CREATE TABLE Locations (
    LocationID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    LocationCode NVARCHAR(30) NOT NULL UNIQUE,
    LocationName NVARCHAR(150) NOT NULL,
    LocationType NVARCHAR(30) NOT NULL,
    Address NVARCHAR(500) NOT NULL,
    City NVARCHAR(100) NOT NULL,
    ContactPhone NVARCHAR(20),
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),
    OperatingHours NVARCHAR(500),
    TimeZoneID NVARCHAR(100) NOT NULL,
    AcceptOrders BIT NOT NULL DEFAULT 1,
    POSEnabled BIT NOT NULL DEFAULT 0,
    PickupEnabled BIT NOT NULL DEFAULT 1,
    DoorstepDeliveryEnabled BIT NOT NULL DEFAULT 1,
    IsLaunchLocation BIT NOT NULL DEFAULT 0,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Inactive',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Locations_Type CHECK (LocationType IN ('Production House', 'Branch')),
    CONSTRAINT CK_Locations_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT CK_Locations_Coordinates CHECK (
        (Latitude IS NULL AND Longitude IS NULL)
        OR (Latitude BETWEEN -90 AND 90 AND Longitude BETWEEN -180 AND 180)
    )
);

CREATE TABLE AdminUsers (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    Role NVARCHAR(30) NOT NULL,
    Mobile NVARCHAR(20) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    LastLoginAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_AdminUsers_Role CHECK (Role IN ('Owner', 'Admin', 'Branch Manager')),
    CONSTRAINT CK_AdminUsers_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended'))
);

CREATE TABLE CustomerSupportUsers (
    SupportUserID INT PRIMARY KEY IDENTITY(1,1),
    Email NVARCHAR(254) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(100) NOT NULL,
    Mobile NVARCHAR(20),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    IsAvailableForAssignment BIT NOT NULL DEFAULT 1,
    AccessExpiresAt DATETIME2,
    LastAssignedAt DATETIME2,
    LastLoginAt DATETIME2,
    CreatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CustomerSupportUsers_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended'))
);

CREATE TABLE CustomerSupportSessions (
    CustomerSupportSessionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SupportUserID INT NOT NULL REFERENCES CustomerSupportUsers(SupportUserID),
    SessionTokenHash VARBINARY(64) NOT NULL UNIQUE,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,
    RevokedAt DATETIME2,
    CONSTRAINT CK_CustomerSupportSessions_Expiry CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_CustomerSupportSessions_Revocation CHECK (RevokedAt IS NULL OR RevokedAt >= CreatedAt)
);

CREATE TABLE CustomerSupportSettings (
    CustomerSupportSettingsID INT PRIMARY KEY IDENTITY(1,1),
    MaximumActiveSupportUsers INT NOT NULL DEFAULT 1,
    MaximumConcurrentSessionsPerUser INT NOT NULL DEFAULT 1,
    TicketAttachmentLimit INT NOT NULL DEFAULT 3,
    TicketAttachmentMaxBytes INT NOT NULL DEFAULT 5242880,
    SupportMailbox NVARCHAR(254) NOT NULL DEFAULT 'support@gunuco.com',
    UpdatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CustomerSupportSettings_Limits CHECK (
        MaximumActiveSupportUsers > 0
        AND MaximumConcurrentSessionsPerUser > 0
        AND TicketAttachmentLimit BETWEEN 0 AND 3
        AND TicketAttachmentMaxBytes > 0
    )
);

CREATE TABLE Customers (
    CustomerID BIGINT PRIMARY KEY IDENTITY(1,1),
    PhoneE164 NVARCHAR(16) NOT NULL UNIQUE,
    FullName NVARCHAR(100),
    Email NVARCHAR(254),
    PhoneVerifiedAt DATETIME2 NOT NULL,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    LastLoginAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_Customers_PhoneE164 CHECK (PhoneE164 LIKE '+[1-9]%' AND PhoneE164 NOT LIKE '%[^0-9+]%' AND LEN(PhoneE164) BETWEEN 8 AND 16),
    CONSTRAINT CK_Customers_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended'))
);

CREATE TABLE CustomerOTPChallenges (
    OTPChallengeID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PhoneE164 NVARCHAR(16) NOT NULL,
    Purpose NVARCHAR(20) NOT NULL,
    OTPHash VARBINARY(64) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    AttemptCount INT NOT NULL DEFAULT 0,
    MaximumAttempts INT NOT NULL DEFAULT 5,
    ConsumedAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_CustomerOTPChallenges_Purpose CHECK (Purpose IN ('Login', 'Change Phone')),
    CONSTRAINT CK_CustomerOTPChallenges_Attempts CHECK (AttemptCount >= 0 AND MaximumAttempts > 0 AND AttemptCount <= MaximumAttempts),
    CONSTRAINT CK_CustomerOTPChallenges_Expiry CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_CustomerOTPChallenges_Consumed CHECK (ConsumedAt IS NULL OR ConsumedAt >= CreatedAt)
);

CREATE TABLE CustomerSessions (
    CustomerSessionID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CustomerID BIGINT NOT NULL REFERENCES Customers(CustomerID),
    RefreshTokenHash VARBINARY(64) NOT NULL UNIQUE,
    TokenFamilyID UNIQUEIDENTIFIER NOT NULL,
    DeviceName NVARCHAR(200),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ExpiresAt DATETIME2 NOT NULL,
    LastUsedAt DATETIME2,
    RevokedAt DATETIME2,
    ReplacedBySessionID UNIQUEIDENTIFIER REFERENCES CustomerSessions(CustomerSessionID),
    CONSTRAINT CK_CustomerSessions_Expiry CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_CustomerSessions_Revocation CHECK (RevokedAt IS NULL OR RevokedAt >= CreatedAt)
);

CREATE TABLE CustomerAddresses (
    CustomerAddressID BIGINT PRIMARY KEY IDENTITY(1,1),
    CustomerID BIGINT NOT NULL REFERENCES Customers(CustomerID),
    Label NVARCHAR(50),
    RecipientName NVARCHAR(100) NOT NULL,
    RecipientPhoneE164 NVARCHAR(16) NOT NULL,
    AddressLine1 NVARCHAR(250) NOT NULL,
    AddressLine2 NVARCHAR(250),
    Landmark NVARCHAR(150),
    City NVARCHAR(100) NOT NULL,
    StateOrProvince NVARCHAR(100) NOT NULL,
    PostalCode NVARCHAR(20) NOT NULL,
    Latitude DECIMAL(9,6) NOT NULL,
    Longitude DECIMAL(9,6) NOT NULL,
    IsDefault BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CustomerAddresses_Coordinates CHECK (Latitude BETWEEN -90 AND 90 AND Longitude BETWEEN -180 AND 180),
    CONSTRAINT CK_CustomerAddresses_Phone CHECK (RecipientPhoneE164 LIKE '+[1-9]%' AND RecipientPhoneE164 NOT LIKE '%[^0-9+]%')
);

CREATE UNIQUE INDEX UX_CustomerAddresses_Default
ON CustomerAddresses(CustomerID) WHERE IsDefault = 1 AND IsActive = 1;

CREATE TABLE CustomerPushDevices (
    CustomerPushDeviceID BIGINT PRIMARY KEY IDENTITY(1,1),
    CustomerID BIGINT NOT NULL REFERENCES Customers(CustomerID),
    ExpoPushToken NVARCHAR(500) NOT NULL UNIQUE,
    Platform NVARCHAR(20) NOT NULL,
    DeviceIdentifierHash VARBINARY(64),
    IsActive BIT NOT NULL DEFAULT 1,
    RegisteredAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    LastSeenAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RevokedAt DATETIME2,
    CONSTRAINT CK_CustomerPushDevices_Platform CHECK (Platform IN ('Android', 'iOS')),
    CONSTRAINT CK_CustomerPushDevices_Revocation CHECK (RevokedAt IS NULL OR RevokedAt >= RegisteredAt)
);

CREATE TABLE StaffLocationAssignments (
    StaffLocationAssignmentID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT NOT NULL REFERENCES AdminUsers(UserID),
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    CanUsePOS BIT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    AssignedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_StaffLocationAssignments UNIQUE (UserID, LocationID)
);

CREATE TABLE ProductCategories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    ParentCategoryID INT REFERENCES ProductCategories(CategoryID),
    CategoryCode NVARCHAR(50) NOT NULL UNIQUE,
    CategoryName NVARCHAR(100) NOT NULL UNIQUE,
    CategoryType NVARCHAR(30) NOT NULL DEFAULT 'General Food',
    CategoryImageURL NVARCHAR(1000),
    CategoryIconName NVARCHAR(100),
    IsActive BIT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    DailyQuota INT,
    SameDayDeliveryEnabled BIT NOT NULL DEFAULT 0,
    SameDayCutoffTime TIME,
    MinimumPreparationMinutes INT,
    SameDaySlotCapacity INT,
    MinimumOrderLeadTimeHours INT,
    MaximumAdvanceOrderHours INT,
    DeliveryFeeExempt BIT NOT NULL DEFAULT 0,
    CreatedByUserID INT REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_ProductCategories_Code CHECK (CategoryCode NOT LIKE '%[^A-Z0-9_]%' AND LEN(CategoryCode) > 0),
    CONSTRAINT CK_ProductCategories_Type CHECK (CategoryType IN ('Cake', 'General Food', 'Beverage')),
    CONSTRAINT CK_ProductCategories_Quota CHECK (DailyQuota IS NULL OR DailyQuota > 0),
    CONSTRAINT CK_ProductCategories_Preparation CHECK (MinimumPreparationMinutes IS NULL OR MinimumPreparationMinutes > 0),
    CONSTRAINT CK_ProductCategories_SlotCapacity CHECK (SameDaySlotCapacity IS NULL OR SameDaySlotCapacity > 0),
    CONSTRAINT CK_ProductCategories_OrderWindow CHECK (
        (MinimumOrderLeadTimeHours IS NULL AND MaximumAdvanceOrderHours IS NULL)
        OR (MinimumOrderLeadTimeHours >= 0 AND MaximumAdvanceOrderHours > MinimumOrderLeadTimeHours)
    ),
    CONSTRAINT CK_ProductCategories_Parent CHECK (ParentCategoryID IS NULL OR ParentCategoryID <> CategoryID)
);

GO
CREATE TRIGGER TR_ProductCategories_ValidateWeddingOrderWindow
ON ProductCategories
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted category
        WHERE (
            category.CategoryCode = 'WEDDING_ANNIVERSARY_CAKES'
            AND (
                ISNULL(category.MinimumOrderLeadTimeHours, -1) <> 72
                OR ISNULL(category.MaximumAdvanceOrderHours, -1) <> 720
                OR category.SameDayDeliveryEnabled <> 0
            )
        ) OR (
            category.CategoryCode <> 'WEDDING_ANNIVERSARY_CAKES'
            AND (category.MinimumOrderLeadTimeHours IS NOT NULL OR category.MaximumAdvanceOrderHours IS NOT NULL)
        )
    )
    BEGIN
        THROW 50003, 'Only Wedding or Anniversary Cakes may use the fixed 72-to-720-hour order window, with same-day disabled.', 1;
    END;
END;
GO

CREATE TABLE IndianStatesAndUnionTerritories (
    StateCode CHAR(2) PRIMARY KEY,
    StateName NVARCHAR(100) NOT NULL UNIQUE,
    RegionType NVARCHAR(20) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CONSTRAINT CK_IndianStatesAndUTs_Code CHECK (StateCode NOT LIKE '%[^A-Z]%'),
    CONSTRAINT CK_IndianStatesAndUTs_Type CHECK (RegionType IN ('State', 'Union Territory'))
);

CREATE TABLE NYCCookiesDeliverySettings (
    CategoryID INT PRIMARY KEY REFERENCES ProductCategories(CategoryID),
    RegularCityDeliveryEnabled BIT NOT NULL DEFAULT 1,
    AllIndiaDeliveryEnabled BIT NOT NULL DEFAULT 0,
    StateCoverageMode NVARCHAR(20),
    NationwideShippingFee DECIMAL(10,2),
    MinimumDeliveryDays INT,
    MaximumDeliveryDays INT,
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_NYCCookiesDeliverySettings_AtLeastOne CHECK (RegularCityDeliveryEnabled = 1 OR AllIndiaDeliveryEnabled = 1),
    CONSTRAINT CK_NYCCookiesDeliverySettings_Nationwide CHECK (
        (AllIndiaDeliveryEnabled = 0 AND StateCoverageMode IS NULL AND NationwideShippingFee IS NULL AND MinimumDeliveryDays IS NULL AND MaximumDeliveryDays IS NULL)
        OR
        (AllIndiaDeliveryEnabled = 1 AND StateCoverageMode IN ('All States', 'Selected States')
            AND NationwideShippingFee >= 0 AND MinimumDeliveryDays > 0 AND MaximumDeliveryDays >= MinimumDeliveryDays)
    )
);

CREATE TABLE NYCCookiesStateDeliveryAvailability (
    CategoryID INT NOT NULL REFERENCES NYCCookiesDeliverySettings(CategoryID),
    StateCode CHAR(2) NOT NULL REFERENCES IndianStatesAndUnionTerritories(StateCode),
    IsAvailable BIT NOT NULL DEFAULT 1,
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CategoryID, StateCode)
);

GO
CREATE TRIGGER TR_NYCCookiesDeliverySettings_ValidateCategory
ON NYCCookiesDeliverySettings
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted setting
        JOIN ProductCategories category ON category.CategoryID = setting.CategoryID
        WHERE category.CategoryCode <> 'GUNUCO_NYC_COOKIES'
    )
    BEGIN
        THROW 50013, 'All-India and regular-city delivery controls are restricted to GUNUCO NYC COOKIES.', 1;
    END;
END;
GO

CREATE TRIGGER TR_NYCCookiesStateDeliveryAvailability_Validate
ON NYCCookiesStateDeliveryAvailability
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted stateSetting
        JOIN NYCCookiesDeliverySettings deliverySetting ON deliverySetting.CategoryID = stateSetting.CategoryID
        WHERE deliverySetting.AllIndiaDeliveryEnabled = 0
           OR deliverySetting.StateCoverageMode <> 'Selected States'
    )
    BEGIN
        THROW 50014, 'State selections require NYC Cookies All-India Delivery with Selected States coverage.', 1;
    END;
END;
GO

CREATE TABLE LocationCategorySettings (
    LocationCategorySettingID INT PRIMARY KEY IDENTITY(1,1),
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    IsAvailable BIT NOT NULL DEFAULT 0,
    AcceptanceMode NVARCHAR(10) NOT NULL DEFAULT 'Automatic',
    DailyQuota INT,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_LocationCategorySettings UNIQUE (LocationID, CategoryID),
    CONSTRAINT CK_LocationCategorySettings_Mode CHECK (AcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_LocationCategorySettings_Quota CHECK (DailyQuota IS NULL OR DailyQuota > 0)
);

CREATE TABLE CancellationPolicies (
    CancellationPolicyID INT PRIMARY KEY IDENTITY(1,1),
    PolicyName NVARCHAR(150) NOT NULL,
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    LocationID INT REFERENCES Locations(LocationID),
    CategoryID INT REFERENCES ProductCategories(CategoryID),
    FullRefundWindowMinutes INT NOT NULL DEFAULT 30,
    PartialRefundWindowMinutes INT NOT NULL DEFAULT 60,
    PartialRefundPercentage DECIMAL(5,2) NOT NULL DEFAULT 50,
    IsActive BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EffectiveTo DATETIME2,
    CreatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CancellationPolicies_Windows CHECK (
        FullRefundWindowMinutes >= 0
        AND PartialRefundWindowMinutes > FullRefundWindowMinutes
    ),
    CONSTRAINT CK_CancellationPolicies_Percentage CHECK (PartialRefundPercentage BETWEEN 0 AND 100),
    CONSTRAINT CK_CancellationPolicies_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo > EffectiveFrom)
);

CREATE TABLE Flavours (
    FlavourID INT PRIMARY KEY IDENTITY(1,1),
    FlavourName NVARCHAR(100) NOT NULL UNIQUE,
    IsAvailable BIT NOT NULL DEFAULT 1,
    DisplayOrder INT
);

CREATE TABLE EggPreferences (
    EggPreferenceID INT PRIMARY KEY IDENTITY(1,1),
    PreferenceName NVARCHAR(20) NOT NULL UNIQUE,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CONSTRAINT CK_EggPreferences_Name CHECK (PreferenceName IN ('Egg', 'Eggless'))
);

CREATE TABLE SugarTypes (
    SugarTypeID INT PRIMARY KEY IDENTITY(1,1),
    SugarTypeName NVARCHAR(100) NOT NULL UNIQUE,
    IsAvailable BIT NOT NULL DEFAULT 1,
    DisplayOrder INT
);

CREATE TABLE FlourTypes (
    FlourTypeID INT PRIMARY KEY IDENTITY(1,1),
    FlourTypeName NVARCHAR(50) NOT NULL UNIQUE,
    IsAvailable BIT NOT NULL DEFAULT 1,
    DisplayOrder INT,
    CONSTRAINT CK_FlourTypes_Name CHECK (FlourTypeName IN ('Maida', 'Wheat Flour'))
);

CREATE TABLE Sizes (
    SizeID INT PRIMARY KEY IDENTITY(1,1),
    SizeName NVARCHAR(50) NOT NULL UNIQUE,
    WeightInGrams INT,
    AllowedForCatalogue BIT NOT NULL DEFAULT 0,
    AllowedForCustomCake BIT NOT NULL DEFAULT 0,
    RequiresManualQuote BIT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CONSTRAINT CK_Sizes_Weight CHECK (WeightInGrams IS NULL OR WeightInGrams > 0),
    CONSTRAINT CK_Sizes_CatalogueLimit CHECK (AllowedForCatalogue = 0 OR (WeightInGrams IS NOT NULL AND WeightInGrams BETWEEN 500 AND 3000)),
    CONSTRAINT CK_Sizes_CustomLimit CHECK (AllowedForCustomCake = 0 OR RequiresManualQuote = 1 OR (WeightInGrams IS NOT NULL AND WeightInGrams BETWEEN 500 AND 10000)),
    CONSTRAINT CK_Sizes_ManualQuote CHECK (RequiresManualQuote = 0 OR (AllowedForCustomCake = 1 AND AllowedForCatalogue = 0))
);

CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    ProductCode NVARCHAR(50) NOT NULL UNIQUE,
    ProductName NVARCHAR(150) NOT NULL,
    ShortDescription NVARCHAR(250),
    Description NVARCHAR(1000),
    ProductImageURL NVARCHAR(1000),
    BasePrice DECIMAL(10,2) NOT NULL,
    DiscountPrice DECIMAL(10,2),
    TaxClass NVARCHAR(50),
    PreparationMinutes INT,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsFeatured BIT NOT NULL DEFAULT 0,
    ProductOptionSchema NVARCHAR(MAX),
    PublicationStatus NVARCHAR(20) NOT NULL DEFAULT 'Draft',
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_Products_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_Products_DiscountPrice CHECK (DiscountPrice IS NULL OR (DiscountPrice >= 0 AND DiscountPrice <= BasePrice)),
    CONSTRAINT CK_Products_Preparation CHECK (PreparationMinutes IS NULL OR PreparationMinutes > 0),
    CONSTRAINT CK_Products_PublicationStatus CHECK (PublicationStatus IN ('Draft', 'Published', 'Archived')),
    CONSTRAINT CK_Products_OptionSchema CHECK (ProductOptionSchema IS NULL OR ISJSON(ProductOptionSchema) = 1)
);

CREATE TABLE ProductImages (
    ProductImageID BIGINT PRIMARY KEY IDENTITY(1,1),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    ImageURL NVARCHAR(1000) NOT NULL,
    AltText NVARCHAR(250) NOT NULL,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_ProductImages_Order UNIQUE (ProductID, DisplayOrder)
);

CREATE TABLE CustomizationTypes (
    CustomizationTypeID INT PRIMARY KEY IDENTITY(1,1),
    CustomizationCode NVARCHAR(50) NOT NULL UNIQUE,
    DisplayName NVARCHAR(100) NOT NULL UNIQUE,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsActive BIT NOT NULL DEFAULT 1,
    CONSTRAINT CK_CustomizationTypes_Code CHECK (CustomizationCode NOT LIKE '%[^A-Z0-9_]%' AND LEN(CustomizationCode) > 0)
);

CREATE TABLE CategoryCustomizationSettings (
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    CustomizationTypeID INT NOT NULL REFERENCES CustomizationTypes(CustomizationTypeID),
    SettingMode NVARCHAR(10) NOT NULL DEFAULT 'Inherit',
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    PRIMARY KEY (CategoryID, CustomizationTypeID),
    CONSTRAINT CK_CategoryCustomizationSettings_Mode CHECK (SettingMode IN ('Inherit', 'ON', 'OFF'))
);

CREATE TABLE ProductCustomizationOverrides (
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    CustomizationTypeID INT NOT NULL REFERENCES CustomizationTypes(CustomizationTypeID),
    OverrideMode NVARCHAR(10) NOT NULL DEFAULT 'Inherit',
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    PRIMARY KEY (ProductID, CustomizationTypeID),
    CONSTRAINT CK_ProductCustomizationOverrides_Mode CHECK (OverrideMode IN ('Inherit', 'ON', 'OFF'))
);

CREATE TABLE CategoryQuantitySettings (
    CategoryID INT PRIMARY KEY REFERENCES ProductCategories(CategoryID),
    SettingMode NVARCHAR(10) NOT NULL DEFAULT 'Inherit',
    MinimumQuantity INT,
    MaximumQuantity INT,
    DefaultQuantity INT,
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CategoryQuantitySettings_Mode CHECK (SettingMode IN ('Inherit', 'Override')),
    CONSTRAINT CK_CategoryQuantitySettings_Values CHECK (
        (SettingMode = 'Inherit' AND MinimumQuantity IS NULL AND MaximumQuantity IS NULL AND DefaultQuantity IS NULL)
        OR (SettingMode = 'Override' AND MinimumQuantity > 0 AND MaximumQuantity >= MinimumQuantity
            AND DefaultQuantity BETWEEN MinimumQuantity AND MaximumQuantity)
    )
);

CREATE TABLE ProductQuantityOverrides (
    ProductID INT PRIMARY KEY REFERENCES Products(ProductID),
    OverrideMode NVARCHAR(10) NOT NULL DEFAULT 'Inherit',
    MinimumQuantity INT,
    MaximumQuantity INT,
    DefaultQuantity INT,
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_ProductQuantityOverrides_Mode CHECK (OverrideMode IN ('Inherit', 'Override')),
    CONSTRAINT CK_ProductQuantityOverrides_Values CHECK (
        (OverrideMode = 'Inherit' AND MinimumQuantity IS NULL AND MaximumQuantity IS NULL AND DefaultQuantity IS NULL)
        OR (OverrideMode = 'Override' AND MinimumQuantity > 0 AND MaximumQuantity >= MinimumQuantity
            AND DefaultQuantity BETWEEN MinimumQuantity AND MaximumQuantity)
    )
);

GO
CREATE TRIGGER TR_CategoryCustomizationSettings_ValidateHierarchy
ON CategoryCustomizationSettings
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted setting
        JOIN ProductCategories category ON category.CategoryID = setting.CategoryID
        WHERE category.ParentCategoryID IS NULL
          AND setting.SettingMode = 'Inherit'
    )
    BEGIN
        THROW 50001, 'Main-category customization settings must be ON or OFF and cannot inherit.', 1;
    END;
END;
GO

CREATE TRIGGER TR_CategoryQuantitySettings_ValidateHierarchy
ON CategoryQuantitySettings
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted setting
        JOIN ProductCategories category ON category.CategoryID = setting.CategoryID
        WHERE category.ParentCategoryID IS NULL
          AND setting.SettingMode = 'Inherit'
    )
    BEGIN
        THROW 50005, 'Main-category quantity settings must be explicit and cannot inherit.', 1;
    END;
END;
GO

CREATE VIEW EffectiveProductCustomizationSettings AS
SELECT
    product.ProductID,
    product.CategoryID,
    customization.CustomizationTypeID,
    customization.CustomizationCode,
    COALESCE(
        NULLIF(productOverride.OverrideMode, 'Inherit'),
        NULLIF(categorySetting.SettingMode, 'Inherit'),
        NULLIF(parentSetting.SettingMode, 'Inherit'),
        'OFF'
    ) AS EffectiveMode,
    CASE
        WHEN NULLIF(productOverride.OverrideMode, 'Inherit') IS NOT NULL THEN 'Product'
        WHEN NULLIF(categorySetting.SettingMode, 'Inherit') IS NOT NULL
            THEN CASE WHEN category.ParentCategoryID IS NULL THEN 'Main Category' ELSE 'Subcategory' END
        WHEN NULLIF(parentSetting.SettingMode, 'Inherit') IS NOT NULL THEN 'Main Category'
        ELSE 'System Default'
    END AS EffectiveSource
FROM Products product
JOIN ProductCategories category ON category.CategoryID = product.CategoryID
CROSS JOIN CustomizationTypes customization
LEFT JOIN ProductCustomizationOverrides productOverride
    ON productOverride.ProductID = product.ProductID
    AND productOverride.CustomizationTypeID = customization.CustomizationTypeID
LEFT JOIN CategoryCustomizationSettings categorySetting
    ON categorySetting.CategoryID = category.CategoryID
    AND categorySetting.CustomizationTypeID = customization.CustomizationTypeID
LEFT JOIN CategoryCustomizationSettings parentSetting
    ON parentSetting.CategoryID = category.ParentCategoryID
    AND parentSetting.CustomizationTypeID = customization.CustomizationTypeID;
GO

CREATE VIEW EffectiveProductQuantitySettings AS
SELECT
    product.ProductID,
    product.CategoryID,
    COALESCE(productQuantity.MinimumQuantity, categoryQuantity.MinimumQuantity, parentQuantity.MinimumQuantity, 1) AS MinimumQuantity,
    COALESCE(productQuantity.MaximumQuantity, categoryQuantity.MaximumQuantity, parentQuantity.MaximumQuantity, 99) AS MaximumQuantity,
    COALESCE(productQuantity.DefaultQuantity, categoryQuantity.DefaultQuantity, parentQuantity.DefaultQuantity, 1) AS DefaultQuantity,
    CASE
        WHEN productQuantity.OverrideMode = 'Override' THEN 'Product'
        WHEN categoryQuantity.SettingMode = 'Override'
            THEN CASE WHEN category.ParentCategoryID IS NULL THEN 'Main Category' ELSE 'Subcategory' END
        WHEN parentQuantity.SettingMode = 'Override' THEN 'Main Category'
        ELSE 'System Default'
    END AS EffectiveSource
FROM Products product
JOIN ProductCategories category ON category.CategoryID = product.CategoryID
LEFT JOIN ProductQuantityOverrides productQuantity
    ON productQuantity.ProductID = product.ProductID AND productQuantity.OverrideMode = 'Override'
LEFT JOIN CategoryQuantitySettings categoryQuantity
    ON categoryQuantity.CategoryID = category.CategoryID AND categoryQuantity.SettingMode = 'Override'
LEFT JOIN CategoryQuantitySettings parentQuantity
    ON parentQuantity.CategoryID = category.ParentCategoryID AND parentQuantity.SettingMode = 'Override';
GO

CREATE TABLE AddOns (
    AddOnID INT PRIMARY KEY IDENTITY(1,1),
    AddOnCode NVARCHAR(50) NOT NULL UNIQUE,
    AddOnName NVARCHAR(150) NOT NULL,
    Description NVARCHAR(1000),
    Price DECIMAL(10,2) NOT NULL,
    IsRequired BIT NOT NULL DEFAULT 0,
    MinimumQuantity INT NOT NULL DEFAULT 0,
    MaximumQuantity INT NOT NULL DEFAULT 1,
    IsAvailable BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    CreatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_AddOns_Code CHECK (AddOnCode NOT LIKE '%[^A-Z0-9_]%' AND LEN(AddOnCode) > 0),
    CONSTRAINT CK_AddOns_Price CHECK (Price >= 0),
    CONSTRAINT CK_AddOns_Quantity CHECK (
        MinimumQuantity >= 0 AND MaximumQuantity >= MinimumQuantity
        AND (IsRequired = 0 OR MinimumQuantity > 0)
    )
);

CREATE TABLE AddOnCategoryAssignments (
    AddOnID INT NOT NULL REFERENCES AddOns(AddOnID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    PRIMARY KEY (AddOnID, CategoryID)
);

CREATE TABLE AddOnProductAssignments (
    AddOnID INT NOT NULL REFERENCES AddOns(AddOnID),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    PRIMARY KEY (AddOnID, ProductID)
);

CREATE TABLE LocationAddOnAvailability (
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    AddOnID INT NOT NULL REFERENCES AddOns(AddOnID),
    IsAvailable BIT NOT NULL DEFAULT 0,
    PriceOverride DECIMAL(10,2),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (LocationID, AddOnID),
    CONSTRAINT CK_LocationAddOnAvailability_Price CHECK (PriceOverride IS NULL OR PriceOverride >= 0)
);

CREATE TABLE LocationProductAvailability (
    LocationProductAvailabilityID INT PRIMARY KEY IDENTITY(1,1),
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    IsAvailable BIT NOT NULL DEFAULT 0,
    DailyQuota INT,
    PriceOverride DECIMAL(10,2),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_LocationProductAvailability UNIQUE (LocationID, ProductID),
    CONSTRAINT CK_LocationProductAvailability_Quota CHECK (DailyQuota IS NULL OR DailyQuota > 0),
    CONSTRAINT CK_LocationProductAvailability_Price CHECK (PriceOverride IS NULL OR PriceOverride >= 0)
);

CREATE TABLE Cakes (
    CakeID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT NOT NULL UNIQUE REFERENCES Products(ProductID),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    CakeName NVARCHAR(200) NOT NULL,
    Description NVARCHAR(1000),
    ImageURL NVARCHAR(1000),
    BasePrice DECIMAL(10,2) NOT NULL,
    DiscountPrice DECIMAL(10,2),
    PreparationTimeMinutes INT,
    DailyQuantityQuota INT,
    SameDayDeliveryEnabled BIT NOT NULL DEFAULT 1,
    IsFeatured BIT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_Cakes_House_Name UNIQUE (ProductionHouseID, CakeName),
    CONSTRAINT CK_Cakes_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_Cakes_Discount CHECK (DiscountPrice IS NULL OR (DiscountPrice >= 0 AND DiscountPrice <= BasePrice)),
    CONSTRAINT CK_Cakes_Quota CHECK (DailyQuantityQuota IS NULL OR DailyQuantityQuota > 0)
);

CREATE TABLE CakeFlavours (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    FlavourID INT NOT NULL REFERENCES Flavours(FlavourID),
    OneKgPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, FlavourID)
);

CREATE TABLE CakeEggPreferences (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    EggPreferenceID INT NOT NULL REFERENCES EggPreferences(EggPreferenceID),
    OneKgPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, EggPreferenceID)
);

CREATE TABLE CakeSugarTypes (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    SugarTypeID INT NOT NULL REFERENCES SugarTypes(SugarTypeID),
    OneKgPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, SugarTypeID)
);

CREATE TABLE CakeFlourTypes (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    FlourTypeID INT NOT NULL REFERENCES FlourTypes(FlourTypeID),
    OneKgPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, FlourTypeID)
);

CREATE TABLE CakeSizes (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    SizeID INT NOT NULL REFERENCES Sizes(SizeID),
    WeightBasePrice DECIMAL(10,2) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, SizeID)
);

CREATE TABLE CakeDefaultSelections (
    CakeID INT PRIMARY KEY REFERENCES Cakes(CakeID),
    DefaultFlavourID INT REFERENCES Flavours(FlavourID),
    DefaultEggPreferenceID INT REFERENCES EggPreferences(EggPreferenceID),
    DefaultSugarTypeID INT REFERENCES SugarTypes(SugarTypeID),
    DefaultFlourTypeID INT REFERENCES FlourTypes(FlourTypeID),
    DefaultSizeID INT REFERENCES Sizes(SizeID),
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

GO
CREATE TRIGGER TR_CakeDefaultSelections_ValidateEffectiveCustomization
ON CakeDefaultSelections
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted defaults
        JOIN Cakes cake ON cake.CakeID = defaults.CakeID
        WHERE
            EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = cake.ProductID AND setting.CustomizationCode = 'FLAVOUR' AND ((setting.EffectiveMode = 'ON' AND defaults.DefaultFlavourID IS NULL) OR (setting.EffectiveMode = 'OFF' AND defaults.DefaultFlavourID IS NOT NULL)))
            OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = cake.ProductID AND setting.CustomizationCode = 'EGG_PREFERENCE' AND ((setting.EffectiveMode = 'ON' AND defaults.DefaultEggPreferenceID IS NULL) OR (setting.EffectiveMode = 'OFF' AND defaults.DefaultEggPreferenceID IS NOT NULL)))
            OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = cake.ProductID AND setting.CustomizationCode = 'SWEETENER_TYPE' AND ((setting.EffectiveMode = 'ON' AND defaults.DefaultSugarTypeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND defaults.DefaultSugarTypeID IS NOT NULL)))
            OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = cake.ProductID AND setting.CustomizationCode = 'FLOUR_TYPE' AND ((setting.EffectiveMode = 'ON' AND defaults.DefaultFlourTypeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND defaults.DefaultFlourTypeID IS NOT NULL)))
            OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = cake.ProductID AND setting.CustomizationCode = 'SIZE_WEIGHT' AND ((setting.EffectiveMode = 'ON' AND defaults.DefaultSizeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND defaults.DefaultSizeID IS NOT NULL)))
    )
    BEGIN
        THROW 50010, 'Cake defaults must be present only for effectively enabled customization groups.', 1;
    END;
END;
GO

CREATE TABLE CustomCakeOneKgPricing (
    CustomCakePricingID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    ComponentType NVARCHAR(30) NOT NULL,
    OptionID INT,
    OptionName NVARCHAR(100) NOT NULL,
    OneKgPriceContribution DECIMAL(10,2) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_CustomCakeOneKgPricing_Type CHECK (ComponentType IN ('Base Price', 'Flavour', 'Egg Preference', 'Sugar Type', 'Flour Type')),
    CONSTRAINT UQ_CustomCakeOneKgPricing UNIQUE (ProductionHouseID, ComponentType, OptionID)
);

CREATE TABLE PaymentMethods (
    PaymentMethodID INT PRIMARY KEY IDENTITY(1,1),
    MethodName NVARCHAR(50) NOT NULL UNIQUE,
    IsOnline BIT NOT NULL DEFAULT 1,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CONSTRAINT CK_PaymentMethods_NoCash CHECK (MethodName NOT IN ('Cash', 'Cash on Delivery', 'COD') AND IsOnline = 1)
);

CREATE TABLE DeliveryPartners (
    DeliveryPartnerID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    PartnerName NVARCHAR(100) NOT NULL,
    Phone NVARCHAR(20) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    VehicleNumber NVARCHAR(30),
    AcceptDeliveries BIT NOT NULL DEFAULT 1,
    ServiceArea NVARCHAR(200),
    Rating DECIMAL(3,2),
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    OnlineStatus NVARCHAR(20) NOT NULL DEFAULT 'Offline',
    TotalDeliveries INT NOT NULL DEFAULT 0,
    SuccessfulDeliveries INT NOT NULL DEFAULT 0,
    DamageIncidents INT NOT NULL DEFAULT 0,
    CONSTRAINT CK_DeliveryPartners_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT CK_DeliveryPartners_Online CHECK (OnlineStatus IN ('Online', 'Offline', 'On Delivery'))
    ,CONSTRAINT CK_DeliveryPartners_Rating CHECK (Rating IS NULL OR Rating BETWEEN 0 AND 5)
);

CREATE TABLE OrderNumberSequences (
    OrderYear SMALLINT PRIMARY KEY,
    NextSequenceNumber INT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OrderNumberSequences_Year CHECK (OrderYear BETWEEN 2000 AND 9999),
    CONSTRAINT CK_OrderNumberSequences_Next CHECK (NextSequenceNumber > 0)
);

CREATE TABLE SupportTicketNumberSequences (
    TicketYearMonth INT PRIMARY KEY,
    NextSequenceNumber INT NOT NULL DEFAULT 1,
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketNumberSequences_YearMonth CHECK (
        TicketYearMonth BETWEEN 200001 AND 999912 AND TicketYearMonth % 100 BETWEEN 1 AND 12
    ),
    CONSTRAINT CK_SupportTicketNumberSequences_Next CHECK (NextSequenceNumber > 0)
);

CREATE TABLE POSCarts (
    POSCartID UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CheckoutIdempotencyKey UNIQUEIDENTIFIER,
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    CreatedByAdminUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    POSExceptionReason NVARCHAR(50) NOT NULL,
    CustomerName NVARCHAR(100),
    CustomerPhone NVARCHAR(20),
    CustomerEmail NVARCHAR(254),
    RequiredPickupAt DATETIME2,
    CartStatus NVARCHAR(20) NOT NULL DEFAULT 'Active',
    QuoteVersion UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    LastQuotedAt DATETIME2,
    ExpiresAt DATETIME2 NOT NULL DEFAULT DATEADD(HOUR, 8, SYSUTCDATETIME()),
    ConvertedOrderID INT,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_POSCarts_Exception CHECK (POSExceptionReason IN ('No mobile device', 'Device unavailable', 'Application unavailable', 'Accessibility assistance')),
    CONSTRAINT CK_POSCarts_Status CHECK (CartStatus IN ('Active', 'Held', 'Converted', 'Abandoned', 'Expired')),
    CONSTRAINT CK_POSCarts_Expiry CHECK (ExpiresAt > CreatedAt),
    CONSTRAINT CK_POSCarts_CustomerPhone CHECK (POSExceptionReason = 'No mobile device' OR CustomerPhone IS NOT NULL),
    CONSTRAINT CK_POSCarts_Conversion CHECK (
        (CartStatus = 'Converted' AND ConvertedOrderID IS NOT NULL)
        OR (CartStatus <> 'Converted' AND ConvertedOrderID IS NULL)
    )
);

CREATE UNIQUE INDEX UX_POSCarts_CheckoutIdempotencyKey
    ON POSCarts(CheckoutIdempotencyKey) WHERE CheckoutIdempotencyKey IS NOT NULL;

CREATE TABLE POSCartItems (
    POSCartItemID BIGINT PRIMARY KEY IDENTITY(1,1),
    POSCartID UNIQUEIDENTIFIER NOT NULL REFERENCES POSCarts(POSCartID),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    SelectedOptions NVARCHAR(MAX),
    Quantity INT NOT NULL DEFAULT 1,
    UnitPrice DECIMAL(10,2) NOT NULL,
    LineTotal AS (UnitPrice * Quantity) PERSISTED,
    PricingRuleVersion UNIQUEIDENTIFIER NOT NULL,
    QuotedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ValidationStatus NVARCHAR(20) NOT NULL DEFAULT 'Valid',
    ValidationMessage NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_POSCartItems_Options CHECK (SelectedOptions IS NULL OR ISJSON(SelectedOptions) = 1),
    CONSTRAINT CK_POSCartItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_POSCartItems_Price CHECK (UnitPrice >= 0),
    CONSTRAINT CK_POSCartItems_Validation CHECK (ValidationStatus IN ('Valid', 'Price Changed', 'Unavailable', 'Quota Exceeded', 'Configuration Changed'))
);

CREATE TABLE Orders (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    CheckoutIdempotencyKey UNIQUEIDENTIFIER,
    PublicOrderID NVARCHAR(20) NOT NULL UNIQUE,
    OrderYear SMALLINT NOT NULL,
    AnnualSequenceNumber INT NOT NULL,
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    SalesChannel NVARCHAR(20) NOT NULL DEFAULT 'Online',
    CreatedByAdminUserID INT REFERENCES AdminUsers(UserID),
    POSExceptionReason NVARCHAR(50),
    CustomerID BIGINT REFERENCES Customers(CustomerID),
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20),
    CustomerEmail NVARCHAR(100),
    FulfilmentMethod NVARCHAR(30) NOT NULL,
    DeliveryAddress NVARCHAR(500),
    DestinationStateCode CHAR(2) REFERENCES IndianStatesAndUnionTerritories(StateCode),
    DestinationLatitude DECIMAL(9,6),
    DestinationLongitude DECIMAL(9,6),
    RouteDistanceKm DECIMAL(8,3),
    DeliveryFeeRuleID INT,
    DeliveryFeeCalculatedAt DATETIME2,
    DeliveryFeeMinimumDistanceSnapshotKm DECIMAL(8,3),
    DeliveryFeeMaximumDistanceSnapshotKm DECIMAL(8,3),
    DeliveryFeeAmountSnapshot DECIMAL(10,2),
    NationwideStateCoverageModeSnapshot NVARCHAR(20),
    NationwideShippingFeeSnapshot DECIMAL(10,2),
    NationwideMinimumDeliveryDaysSnapshot INT,
    NationwideMaximumDeliveryDaysSnapshot INT,
    PickupStatus NVARCHAR(30) NOT NULL DEFAULT 'Not Applicable',
    CollectedByName NVARCHAR(100),
    CollectedAt DATETIME2,
    RequestedDeliveryAt DATETIME2 NOT NULL,
    OrderStatus NVARCHAR(40) NOT NULL DEFAULT 'Not Accepted',
    PaymentMethodID INT REFERENCES PaymentMethods(PaymentMethodID),
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    CancellationPolicyID INT REFERENCES CancellationPolicies(CancellationPolicyID),
    CancellationWindowStartedAt DATETIME2,
    FullRefundCancellationDeadline DATETIME2,
    PartialRefundCancellationDeadline DATETIME2,
    FullRefundWindowMinutesSnapshot INT,
    PartialRefundWindowMinutesSnapshot INT,
    PartialRefundPercentageSnapshot DECIMAL(5,2),
    Subtotal DECIMAL(10,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    DeliveryFee DECIMAL(10,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    TotalAmount DECIMAL(10,2) NOT NULL,
    AmountPaid DECIMAL(10,2) NOT NULL DEFAULT 0,
    DeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
    DeliveryStatus NVARCHAR(30) NOT NULL DEFAULT 'Not Required',
    DeliveryAssignmentMode NVARCHAR(10),
    AcceptanceMode NVARCHAR(10) NOT NULL,
    AcceptedAutomatically BIT NOT NULL DEFAULT 0,
    AcceptedByUserID INT REFERENCES AdminUsers(UserID),
    AcceptedAt DATETIME2,
    CompletedAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_Orders_Status CHECK (OrderStatus IN ('Not Accepted', 'Clarification Requested', 'Rejected', 'Accepted', 'Preparing', 'Packed', 'Ready for Delivery', 'Delivery Partner Assigning', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Cancelled', 'Return Requested', 'Resolved')),
    CONSTRAINT CK_Orders_SalesChannel CHECK (SalesChannel IN ('Online', 'POS')),
    CONSTRAINT CK_Orders_ChannelActor CHECK (
        (SalesChannel = 'Online' AND CreatedByAdminUserID IS NULL AND POSExceptionReason IS NULL AND CustomerID IS NOT NULL AND CustomerPhone IS NOT NULL)
        OR (SalesChannel = 'POS' AND CreatedByAdminUserID IS NOT NULL AND POSExceptionReason IS NOT NULL)
    ),
    CONSTRAINT CK_Orders_POSException CHECK (
        POSExceptionReason IS NULL OR POSExceptionReason IN ('No mobile device', 'Device unavailable', 'Application unavailable', 'Accessibility assistance')
    ),
    CONSTRAINT CK_Orders_POSCustomerPhone CHECK (
        SalesChannel <> 'POS' OR POSExceptionReason = 'No mobile device' OR CustomerPhone IS NOT NULL
    ),
    CONSTRAINT CK_Orders_POSFulfilment CHECK (SalesChannel <> 'POS' OR FulfilmentMethod = 'Pickup-at-Store'),
    CONSTRAINT CK_Orders_POSAcceptance CHECK (
        SalesChannel <> 'POS' OR (AcceptanceMode = 'Automatic' AND AcceptedAutomatically = 1 AND OrderStatus <> 'Not Accepted')
    ),
    CONSTRAINT UQ_Orders_AnnualSequence UNIQUE (OrderYear, AnnualSequenceNumber),
    CONSTRAINT CK_Orders_AnnualSequence CHECK (OrderYear BETWEEN 2000 AND 9999 AND AnnualSequenceNumber > 0),
    CONSTRAINT CK_Orders_PublicOrderID CHECK (
        PublicOrderID = RIGHT(CONVERT(VARCHAR(4), OrderYear), 2) + '-'
            + CASE WHEN AnnualSequenceNumber < 10 THEN '0' ELSE '' END
            + CONVERT(VARCHAR(10), AnnualSequenceNumber)
    ),
    CONSTRAINT CK_Orders_FulfilmentMethod CHECK (FulfilmentMethod IN ('Pickup-at-Store', 'Doorstep-Delivery', 'Nationwide-Delivery')),
    CONSTRAINT CK_Orders_FulfilmentDetails CHECK (
        (FulfilmentMethod = 'Pickup-at-Store'
            AND DeliveryAddress IS NULL AND DestinationStateCode IS NULL AND DestinationLatitude IS NULL AND DestinationLongitude IS NULL AND RouteDistanceKm IS NULL
            AND DeliveryFee = 0 AND DeliveryFeeRuleID IS NULL AND DeliveryFeeCalculatedAt IS NULL
            AND DeliveryFeeMinimumDistanceSnapshotKm IS NULL AND DeliveryFeeMaximumDistanceSnapshotKm IS NULL AND DeliveryFeeAmountSnapshot IS NULL
            AND NationwideStateCoverageModeSnapshot IS NULL AND NationwideShippingFeeSnapshot IS NULL
            AND NationwideMinimumDeliveryDaysSnapshot IS NULL AND NationwideMaximumDeliveryDaysSnapshot IS NULL
            AND DeliveryPartnerID IS NULL AND DeliveryAssignmentMode IS NULL AND DeliveryStatus = 'Not Required')
        OR
        (FulfilmentMethod = 'Doorstep-Delivery'
            AND DeliveryAddress IS NOT NULL AND DestinationLatitude IS NOT NULL AND DestinationLongitude IS NOT NULL AND RouteDistanceKm IS NOT NULL
            AND DeliveryFeeRuleID IS NOT NULL AND DeliveryFeeCalculatedAt IS NOT NULL
            AND NationwideStateCoverageModeSnapshot IS NULL AND NationwideShippingFeeSnapshot IS NULL
            AND NationwideMinimumDeliveryDaysSnapshot IS NULL AND NationwideMaximumDeliveryDaysSnapshot IS NULL
            AND DeliveryAssignmentMode IS NOT NULL AND DeliveryStatus <> 'Not Required' AND PickupStatus = 'Not Applicable')
        OR
        (FulfilmentMethod = 'Nationwide-Delivery'
            AND DeliveryAddress IS NOT NULL AND DestinationStateCode IS NOT NULL
            AND DestinationLatitude IS NOT NULL AND DestinationLongitude IS NOT NULL AND RouteDistanceKm IS NULL
            AND DeliveryFeeRuleID IS NULL AND DeliveryFeeCalculatedAt IS NOT NULL
            AND DeliveryFeeMinimumDistanceSnapshotKm IS NULL AND DeliveryFeeMaximumDistanceSnapshotKm IS NULL
            AND DeliveryFeeAmountSnapshot = DeliveryFee
            AND NationwideStateCoverageModeSnapshot IN ('All States', 'Selected States')
            AND NationwideShippingFeeSnapshot = DeliveryFee
            AND NationwideMinimumDeliveryDaysSnapshot > 0
            AND NationwideMaximumDeliveryDaysSnapshot >= NationwideMinimumDeliveryDaysSnapshot
            AND DeliveryPartnerID IS NULL AND DeliveryAssignmentMode IS NULL
            AND DeliveryStatus = 'Not Required' AND PickupStatus = 'Not Applicable')
    ),
    CONSTRAINT CK_Orders_AcceptanceMode CHECK (AcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_Orders_AcceptanceActor CHECK ((AcceptedAutomatically = 1 AND AcceptedByUserID IS NULL) OR AcceptedAutomatically = 0),
    CONSTRAINT CK_Orders_DeliveryStatus CHECK (DeliveryStatus IN ('Not Required', 'Not Started', 'Pending Assignment', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled')),
    CONSTRAINT CK_Orders_DeliveryMode CHECK (DeliveryAssignmentMode IS NULL OR DeliveryAssignmentMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_Orders_PickupStatus CHECK (PickupStatus IN ('Not Applicable', 'Pickup Scheduled', 'Ready for Pickup', 'Collected', 'Cancelled')),
    CONSTRAINT CK_Orders_PickupStatusForFulfilment CHECK (
        (FulfilmentMethod = 'Pickup-at-Store' AND PickupStatus <> 'Not Applicable')
        OR (FulfilmentMethod IN ('Doorstep-Delivery', 'Nationwide-Delivery') AND PickupStatus = 'Not Applicable')
    ),
    CONSTRAINT CK_Orders_Collection CHECK (PickupStatus <> 'Collected' OR (CollectedByName IS NOT NULL AND CollectedAt IS NOT NULL)),
    CONSTRAINT CK_Orders_PaymentStatus CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed', 'Refunded', 'Partially Refunded')),
    CONSTRAINT CK_Orders_Amounts CHECK (
        Subtotal >= 0 AND DiscountAmount >= 0 AND DiscountAmount <= Subtotal
        AND DeliveryFee >= 0 AND TaxAmount >= 0
        AND TotalAmount = Subtotal - DiscountAmount + DeliveryFee + TaxAmount
    ),
    CONSTRAINT CK_Orders_AmountPaid CHECK (AmountPaid >= 0 AND AmountPaid <= TotalAmount),
    CONSTRAINT CK_Orders_PaymentMethod CHECK (PaymentStatus = 'Pending' OR PaymentMethodID IS NOT NULL),
    CONSTRAINT CK_Orders_CancellationPolicySnapshot CHECK (
        (CancellationWindowStartedAt IS NULL
            AND FullRefundCancellationDeadline IS NULL
            AND PartialRefundCancellationDeadline IS NULL
            AND FullRefundWindowMinutesSnapshot IS NULL
            AND PartialRefundWindowMinutesSnapshot IS NULL
            AND PartialRefundPercentageSnapshot IS NULL)
        OR
        (CancellationPolicyID IS NOT NULL
            AND CancellationWindowStartedAt IS NOT NULL
            AND FullRefundCancellationDeadline = DATEADD(MINUTE, FullRefundWindowMinutesSnapshot, CancellationWindowStartedAt)
            AND PartialRefundCancellationDeadline = DATEADD(MINUTE, PartialRefundWindowMinutesSnapshot, CancellationWindowStartedAt)
            AND FullRefundWindowMinutesSnapshot >= 0
            AND PartialRefundWindowMinutesSnapshot > FullRefundWindowMinutesSnapshot
            AND PartialRefundPercentageSnapshot BETWEEN 0 AND 100)
    ),
    CONSTRAINT CK_Orders_FullPaymentState CHECK (
        (PaymentStatus = 'Pending' AND AmountPaid = 0)
        OR (PaymentStatus = 'Completed' AND AmountPaid = TotalAmount)
        OR PaymentStatus IN ('Failed', 'Refunded', 'Partially Refunded')
    ),
    CONSTRAINT CK_Orders_ProductionPaymentGate CHECK (
        OrderStatus NOT IN ('Accepted', 'Preparing', 'Packed', 'Ready for Delivery', 'Delivery Partner Assigning', 'Assigned', 'Picked Up', 'Out for Delivery')
        OR PaymentStatus = 'Completed'
    ),
    CONSTRAINT CK_Orders_FullPaymentHandoverGate CHECK (
        AmountPaid = TotalAmount
        OR (
            OrderStatus NOT IN ('Picked Up', 'Out for Delivery', 'Delivered')
            AND DeliveryStatus NOT IN ('Picked Up', 'Out for Delivery', 'Delivered')
            AND PickupStatus <> 'Collected'
        )
    ),
    CONSTRAINT CK_Orders_DeliveryFeeSnapshot CHECK (
        (FulfilmentMethod = 'Pickup-at-Store' AND DeliveryFeeAmountSnapshot IS NULL)
        OR
        (FulfilmentMethod = 'Doorstep-Delivery' AND DeliveryFeeAmountSnapshot = DeliveryFee AND DeliveryFeeMaximumDistanceSnapshotKm IS NOT NULL)
        OR
        (FulfilmentMethod = 'Nationwide-Delivery' AND DeliveryFeeAmountSnapshot = DeliveryFee
            AND NationwideShippingFeeSnapshot = DeliveryFee AND DeliveryFeeMaximumDistanceSnapshotKm IS NULL)
    ),
    CONSTRAINT CK_Orders_CompletedAt CHECK (
        (CompletedAt IS NULL AND OrderStatus NOT IN ('Delivered', 'Cancelled', 'Resolved') AND PickupStatus <> 'Collected')
        OR (CompletedAt IS NOT NULL AND (OrderStatus IN ('Delivered', 'Cancelled', 'Resolved') OR PickupStatus = 'Collected'))
    )
);

GO
CREATE TRIGGER TR_Orders_ValidateCategoryOrderWindow
ON Orders
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted newOrder
        JOIN deleted oldOrder ON oldOrder.OrderID = newOrder.OrderID
        WHERE newOrder.CreatedAt <> oldOrder.CreatedAt
    )
    BEGIN
        THROW 50004, 'Order CreatedAt is immutable.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM inserted orderRow
        JOIN ProductCategories category ON category.CategoryID = orderRow.CategoryID
        WHERE category.MinimumOrderLeadTimeHours IS NOT NULL
          AND (
              orderRow.RequestedDeliveryAt < DATEADD(HOUR, category.MinimumOrderLeadTimeHours, orderRow.CreatedAt)
              OR orderRow.RequestedDeliveryAt > DATEADD(HOUR, category.MaximumAdvanceOrderHours, orderRow.CreatedAt)
          )
    )
    BEGIN
        THROW 50002, 'Requested delivery time is outside the selected category order window.', 1;
    END;
END;
GO

CREATE TRIGGER TR_Orders_ValidateNYCCookiesDeliveryCoverage
ON Orders
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted orderRow
        JOIN ProductCategories category ON category.CategoryID = orderRow.CategoryID
        LEFT JOIN NYCCookiesDeliverySettings deliverySetting ON deliverySetting.CategoryID = orderRow.CategoryID
        WHERE
            (orderRow.FulfilmentMethod = 'Nationwide-Delivery' AND (
                category.CategoryCode <> 'GUNUCO_NYC_COOKIES'
                OR ISNULL(deliverySetting.AllIndiaDeliveryEnabled, 0) = 0
                OR orderRow.NationwideStateCoverageModeSnapshot <> deliverySetting.StateCoverageMode
                OR orderRow.NationwideShippingFeeSnapshot <> deliverySetting.NationwideShippingFee
                OR orderRow.NationwideMinimumDeliveryDaysSnapshot <> deliverySetting.MinimumDeliveryDays
                OR orderRow.NationwideMaximumDeliveryDaysSnapshot <> deliverySetting.MaximumDeliveryDays
                OR NOT EXISTS (
                    SELECT 1
                    FROM IndianStatesAndUnionTerritories state
                    WHERE state.StateCode = orderRow.DestinationStateCode
                      AND state.IsActive = 1
                )
                OR (deliverySetting.StateCoverageMode = 'Selected States' AND NOT EXISTS (
                    SELECT 1
                    FROM NYCCookiesStateDeliveryAvailability stateSetting
                    WHERE stateSetting.CategoryID = orderRow.CategoryID
                      AND stateSetting.StateCode = orderRow.DestinationStateCode
                      AND stateSetting.IsAvailable = 1
                ))
            ))
            OR
            (category.CategoryCode = 'GUNUCO_NYC_COOKIES'
                AND orderRow.FulfilmentMethod = 'Doorstep-Delivery'
                AND ISNULL(deliverySetting.RegularCityDeliveryEnabled, 0) = 0)
    )
    BEGIN
        THROW 50015, 'The selected NYC Cookies delivery method or destination state is not enabled.', 1;
    END;
END;
GO

CREATE VIEW WeddingAnniversaryCakeOrders AS
SELECT orderRow.*
FROM Orders orderRow
JOIN ProductCategories category ON category.CategoryID = orderRow.CategoryID
WHERE category.CategoryCode = 'WEDDING_ANNIVERSARY_CAKES';
GO

CREATE TABLE OrderIDValidations (
    OrderIDValidationID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    ValidationContext NVARCHAR(20) NOT NULL,
    SubmittedOrderID NVARCHAR(20) NOT NULL,
    IsSuccessful BIT NOT NULL,
    ValidatedByAdminUserID INT REFERENCES AdminUsers(UserID),
    ValidatedByDeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
    ValidatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OrderIDValidations_Context CHECK (ValidationContext IN ('At Store', 'At Doorstep')),
    CONSTRAINT CK_OrderIDValidations_Actor CHECK (
        (ValidationContext = 'At Store' AND ValidatedByAdminUserID IS NOT NULL AND ValidatedByDeliveryPartnerID IS NULL)
        OR
        (ValidationContext = 'At Doorstep' AND ValidatedByAdminUserID IS NULL AND ValidatedByDeliveryPartnerID IS NOT NULL)
    )
);

GO
CREATE TRIGGER TR_OrderIDValidations_VerifyExactMatchAndActor
ON OrderIDValidations
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted validation
        JOIN Orders orderRow ON orderRow.OrderID = validation.OrderID
        WHERE validation.IsSuccessful <> CASE WHEN validation.SubmittedOrderID = orderRow.PublicOrderID THEN 1 ELSE 0 END
           OR (validation.ValidationContext = 'At Store' AND orderRow.FulfilmentMethod <> 'Pickup-at-Store')
           OR (validation.ValidationContext = 'At Doorstep' AND (
                orderRow.FulfilmentMethod <> 'Doorstep-Delivery'
                OR validation.ValidatedByDeliveryPartnerID <> orderRow.DeliveryPartnerID
           ))
    )
    BEGIN
        THROW 50011, 'Order ID validation result, context, or validator does not match the server order.', 1;
    END;
END;
GO

CREATE TRIGGER TR_Orders_RequireFulfilmentValidation
ON Orders
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted orderRow
        WHERE
            (orderRow.PickupStatus = 'Collected' AND NOT EXISTS (
                SELECT 1
                FROM OrderIDValidations validation
                WHERE validation.OrderID = orderRow.OrderID
                  AND validation.ValidationContext = 'At Store'
                  AND validation.IsSuccessful = 1
            ))
            OR
            (orderRow.DeliveryStatus = 'Delivered' AND NOT EXISTS (
                SELECT 1
                FROM OrderIDValidations validation
                WHERE validation.OrderID = orderRow.OrderID
                  AND validation.ValidationContext = 'At Doorstep'
                  AND validation.ValidatedByDeliveryPartnerID = orderRow.DeliveryPartnerID
                  AND validation.IsSuccessful = 1
            ))
    )
    BEGIN
        THROW 50012, 'Collected or Delivered requires a successful authorized Order ID validation.', 1;
    END;
END;
GO

CREATE TABLE DeliveryFeeRules (
    DeliveryFeeRuleID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    MinimumDistanceExclusiveKm DECIMAL(8,3),
    MaximumDistanceInclusiveKm DECIMAL(8,3) NOT NULL,
    FeeAmount DECIMAL(10,2) NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EffectiveTo DATETIME2,
    CreatedByUserID INT REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_DeliveryFeeRules_Distance CHECK (
        MaximumDistanceInclusiveKm > 0
        AND (MinimumDistanceExclusiveKm IS NULL OR MinimumDistanceExclusiveKm >= 0)
        AND (MinimumDistanceExclusiveKm IS NULL OR MaximumDistanceInclusiveKm > MinimumDistanceExclusiveKm)
    ),
    CONSTRAINT CK_DeliveryFeeRules_Fee CHECK (FeeAmount >= 0),
    CONSTRAINT CK_DeliveryFeeRules_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo > EffectiveFrom),
    CONSTRAINT UQ_DeliveryFeeRules_Band UNIQUE (ProductionHouseID, CategoryID, MinimumDistanceExclusiveKm, MaximumDistanceInclusiveKm, EffectiveFrom)
);

GO
CREATE TRIGGER TR_DeliveryFeeRules_ValidateNonOverlap
ON DeliveryFeeRules
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted candidate
        JOIN DeliveryFeeRules existing
          ON existing.ProductionHouseID = candidate.ProductionHouseID
         AND existing.CategoryID = candidate.CategoryID
         AND existing.DeliveryFeeRuleID <> candidate.DeliveryFeeRuleID
         AND existing.IsAvailable = 1
         AND candidate.IsAvailable = 1
         AND existing.MaximumDistanceInclusiveKm > ISNULL(candidate.MinimumDistanceExclusiveKm, 0)
         AND candidate.MaximumDistanceInclusiveKm > ISNULL(existing.MinimumDistanceExclusiveKm, 0)
         AND existing.EffectiveFrom < ISNULL(candidate.EffectiveTo, CONVERT(DATETIME2, '9999-12-31'))
         AND candidate.EffectiveFrom < ISNULL(existing.EffectiveTo, CONVERT(DATETIME2, '9999-12-31'))
    )
    BEGIN
        THROW 50008, 'Active delivery fee distance bands cannot overlap for the same category and effective period.', 1;
    END;
END;
GO

ALTER TABLE Orders
ADD CONSTRAINT FK_Orders_DeliveryFeeRule
FOREIGN KEY (DeliveryFeeRuleID) REFERENCES DeliveryFeeRules(DeliveryFeeRuleID);

CREATE TABLE OrderItems (
    OrderItemID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    CakeID INT REFERENCES Cakes(CakeID),
    FlavourID INT REFERENCES Flavours(FlavourID),
    EggPreferenceID INT REFERENCES EggPreferences(EggPreferenceID),
    SugarTypeID INT REFERENCES SugarTypes(SugarTypeID),
    FlourTypeID INT REFERENCES FlourTypes(FlourTypeID),
    SizeID INT REFERENCES Sizes(SizeID),
    Quantity INT NOT NULL,
    UnitPrice DECIMAL(10,2) NOT NULL,
    TotalPrice DECIMAL(10,2) NOT NULL,
    BasePriceSnapshot DECIMAL(10,2) NOT NULL,
    FlavourAdjustmentSnapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    EggAdjustmentSnapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    SugarAdjustmentSnapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    FlourAdjustmentSnapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    SizeAdjustmentSnapshot DECIMAL(10,2) NOT NULL DEFAULT 0,
    PricingRuleVersion UNIQUEIDENTIFIER NOT NULL,
    PriceCalculatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    IsCustomCake BIT NOT NULL DEFAULT 0,
    CONSTRAINT CK_OrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_OrderItems_Prices CHECK (UnitPrice >= 0 AND TotalPrice >= 0 AND BasePriceSnapshot >= 0)
);

GO
CREATE TRIGGER TR_OrderItems_ValidateEffectiveCustomization
ON OrderItems
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted item
        JOIN EffectiveProductQuantitySettings quantitySetting ON quantitySetting.ProductID = item.ProductID
        WHERE item.IsCustomCake = 0
          AND item.Quantity NOT BETWEEN quantitySetting.MinimumQuantity AND quantitySetting.MaximumQuantity
    )
    BEGIN
        THROW 50006, 'Order item quantity is outside the effective product quantity range.', 1;
    END;

    IF EXISTS (
        SELECT 1
        FROM inserted item
        WHERE item.IsCustomCake = 0
          AND (
              EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = item.ProductID AND setting.CustomizationCode = 'FLAVOUR' AND ((setting.EffectiveMode = 'ON' AND item.FlavourID IS NULL) OR (setting.EffectiveMode = 'OFF' AND item.FlavourID IS NOT NULL)))
              OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = item.ProductID AND setting.CustomizationCode = 'EGG_PREFERENCE' AND ((setting.EffectiveMode = 'ON' AND item.EggPreferenceID IS NULL) OR (setting.EffectiveMode = 'OFF' AND item.EggPreferenceID IS NOT NULL)))
              OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = item.ProductID AND setting.CustomizationCode = 'SWEETENER_TYPE' AND ((setting.EffectiveMode = 'ON' AND item.SugarTypeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND item.SugarTypeID IS NOT NULL)))
              OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = item.ProductID AND setting.CustomizationCode = 'FLOUR_TYPE' AND ((setting.EffectiveMode = 'ON' AND item.FlourTypeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND item.FlourTypeID IS NOT NULL)))
              OR EXISTS (SELECT 1 FROM EffectiveProductCustomizationSettings setting WHERE setting.ProductID = item.ProductID AND setting.CustomizationCode = 'SIZE_WEIGHT' AND ((setting.EffectiveMode = 'ON' AND item.SizeID IS NULL) OR (setting.EffectiveMode = 'OFF' AND item.SizeID IS NOT NULL)))
          )
    )
    BEGIN
        THROW 50007, 'Order item selections do not match the effective product customization settings.', 1;
    END;
END;
GO

CREATE TABLE OrderItemAddOns (
    OrderItemAddOnID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderItemID INT NOT NULL REFERENCES OrderItems(OrderItemID),
    AddOnID INT REFERENCES AddOns(AddOnID),
    AddOnNameSnapshot NVARCHAR(150) NOT NULL,
    DescriptionSnapshot NVARCHAR(1000),
    UnitPriceSnapshot DECIMAL(10,2) NOT NULL,
    Quantity INT NOT NULL,
    TotalPrice AS (UnitPriceSnapshot * Quantity) PERSISTED,
    WasRequired BIT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OrderItemAddOns_Price CHECK (UnitPriceSnapshot >= 0),
    CONSTRAINT CK_OrderItemAddOns_Quantity CHECK (Quantity > 0)
);

GO
CREATE VIEW DeliveryPartnerAssignedOrderItems AS
SELECT
    assignment.DeliveryAssignmentID,
    assignment.DeliveryPartnerID,
    product.ProductName,
    product.ProductImageURL,
    flavour.FlavourName,
    eggPreference.PreferenceName AS EggPreferenceName,
    sugarType.SugarTypeName,
    flourType.FlourTypeName,
    size.SizeName,
    size.WeightInGrams,
    item.Quantity,
    item.IsCustomCake
FROM DeliveryAssignments assignment
JOIN OrderItems item ON item.OrderID = assignment.OrderID
JOIN Products product ON product.ProductID = item.ProductID
LEFT JOIN Flavours flavour ON flavour.FlavourID = item.FlavourID
LEFT JOIN EggPreferences eggPreference ON eggPreference.EggPreferenceID = item.EggPreferenceID
LEFT JOIN SugarTypes sugarType ON sugarType.SugarTypeID = item.SugarTypeID
LEFT JOIN FlourTypes flourType ON flourType.FlourTypeID = item.FlourTypeID
LEFT JOIN Sizes size ON size.SizeID = item.SizeID;
GO

CREATE VIEW DeliveryPartnerAssignedOrderItemAddOns AS
SELECT
    assignment.DeliveryAssignmentID,
    assignment.DeliveryPartnerID,
    product.ProductName,
    addOn.AddOnNameSnapshot,
    addOn.DescriptionSnapshot,
    addOn.Quantity,
    addOn.WasRequired
FROM DeliveryAssignments assignment
JOIN OrderItems item ON item.OrderID = assignment.OrderID
JOIN Products product ON product.ProductID = item.ProductID
JOIN OrderItemAddOns addOn ON addOn.OrderItemID = item.OrderItemID;
GO

CREATE TABLE OrderItemPriceComponents (
    PriceComponentID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderItemID INT NOT NULL REFERENCES OrderItems(OrderItemID),
    ComponentType NVARCHAR(30) NOT NULL,
    SelectedOptionID INT,
    SelectedOptionName NVARCHAR(100) NOT NULL,
    PriceContribution DECIMAL(10,2) NOT NULL,
    DisplayOrder INT NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OrderItemPriceComponents_Type CHECK (ComponentType IN ('Base Price', 'Flavour', 'Egg Preference', 'Sugar Type', 'Flour Type', 'Size')),
    CONSTRAINT UQ_OrderItemPriceComponents_Type UNIQUE (OrderItemID, ComponentType)
);

CREATE TABLE DeliverySlots (
    DeliverySlotID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    SlotName NVARCHAR(100) NOT NULL,
    StartTime TIME NOT NULL,
    EndTime TIME NOT NULL,
    Capacity INT NOT NULL,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CONSTRAINT CK_DeliverySlots_Time CHECK (EndTime > StartTime),
    CONSTRAINT CK_DeliverySlots_Capacity CHECK (Capacity > 0),
    CONSTRAINT UQ_DeliverySlots UNIQUE (ProductionHouseID, CategoryID, SlotName)
);

CREATE TABLE CustomCakeDetails (
    OrderItemID INT PRIMARY KEY REFERENCES OrderItems(OrderItemID),
    Occasion NVARCHAR(100),
    ThemeDescription NVARCHAR(500),
    ReferenceImageURL NVARCHAR(1000),
    CakeMessage NVARCHAR(200),
    SpecialInstructions NVARCHAR(1000),
    QuotedPrice DECIMAL(10,2),
    RequestedWeightInGrams INT,
    RequiresManualQuote BIT NOT NULL DEFAULT 0,
    QuoteStatus NVARCHAR(20) NOT NULL DEFAULT 'Not Required',
    AdminQuotedByUserID INT REFERENCES AdminUsers(UserID),
    AdminQuotedAt DATETIME2,
    CustomerRespondedAt DATETIME2,
    CalculatedPriceBeforeManualAdjustment DECIMAL(10,2),
    WeightInKgMultiplier DECIMAL(6,3),
    ManualPriceAdjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    ManualAdjustmentReason NVARCHAR(500),
    AdminNotes NVARCHAR(1000),
    CONSTRAINT CK_CustomCakeDetails_Price CHECK (QuotedPrice IS NULL OR QuotedPrice >= 0),
    CONSTRAINT CK_CustomCakeDetails_Weight CHECK (RequestedWeightInGrams IS NULL OR RequestedWeightInGrams >= 500),
    CONSTRAINT CK_CustomCakeDetails_ManualWeight CHECK (
        RequiresManualQuote = 0
        OR (RequestedWeightInGrams IS NOT NULL AND RequestedWeightInGrams > 10000)
        OR ManualAdjustmentReason IS NOT NULL
    ),
    CONSTRAINT CK_CustomCakeDetails_QuoteStatus CHECK (QuoteStatus IN ('Not Required', 'Pending Review', 'Quoted', 'Customer Approved', 'Customer Rejected'))
    ,CONSTRAINT CK_CustomCakeDetails_QuoteLifecycle CHECK (
        (QuoteStatus IN ('Not Required', 'Pending Review') AND AdminQuotedByUserID IS NULL AND AdminQuotedAt IS NULL AND CustomerRespondedAt IS NULL)
        OR (QuoteStatus = 'Quoted' AND QuotedPrice IS NOT NULL AND AdminQuotedByUserID IS NOT NULL AND AdminQuotedAt IS NOT NULL AND CustomerRespondedAt IS NULL)
        OR (QuoteStatus IN ('Customer Approved', 'Customer Rejected') AND QuotedPrice IS NOT NULL AND AdminQuotedByUserID IS NOT NULL AND AdminQuotedAt IS NOT NULL AND CustomerRespondedAt IS NOT NULL)
    )
    ,CONSTRAINT CK_CustomCakeDetails_Multiplier CHECK (WeightInKgMultiplier IS NULL OR WeightInKgMultiplier > 0)
    ,CONSTRAINT CK_CustomCakeDetails_AdjustmentReason CHECK (ManualPriceAdjustment = 0 OR ManualAdjustmentReason IS NOT NULL)
);

CREATE TABLE CustomCakeQuoteHistory (
    CustomCakeQuoteHistoryID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderItemID INT NOT NULL REFERENCES CustomCakeDetails(OrderItemID),
    PreviousQuoteStatus NVARCHAR(20),
    NewQuoteStatus NVARCHAR(20) NOT NULL,
    QuotedPrice DECIMAL(10,2),
    CalculatedPriceBeforeManualAdjustment DECIMAL(10,2),
    ManualPriceAdjustment DECIMAL(10,2) NOT NULL DEFAULT 0,
    ManualAdjustmentReason NVARCHAR(500),
    ChangedByActorType NVARCHAR(20) NOT NULL,
    ChangedByAdminUserID INT REFERENCES AdminUsers(UserID),
    ChangedByCustomerID BIGINT REFERENCES Customers(CustomerID),
    Details NVARCHAR(MAX),
    ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_CustomCakeQuoteHistory_PreviousStatus CHECK (PreviousQuoteStatus IS NULL OR PreviousQuoteStatus IN ('Not Required', 'Pending Review', 'Quoted', 'Customer Approved', 'Customer Rejected')),
    CONSTRAINT CK_CustomCakeQuoteHistory_NewStatus CHECK (NewQuoteStatus IN ('Not Required', 'Pending Review', 'Quoted', 'Customer Approved', 'Customer Rejected')),
    CONSTRAINT CK_CustomCakeQuoteHistory_Price CHECK (QuotedPrice IS NULL OR QuotedPrice >= 0),
    CONSTRAINT CK_CustomCakeQuoteHistory_AdjustmentReason CHECK (ManualPriceAdjustment = 0 OR ManualAdjustmentReason IS NOT NULL),
    CONSTRAINT CK_CustomCakeQuoteHistory_ActorType CHECK (ChangedByActorType IN ('Admin', 'Customer', 'System')),
    CONSTRAINT CK_CustomCakeQuoteHistory_Actor CHECK (
        (ChangedByActorType = 'Admin' AND ChangedByAdminUserID IS NOT NULL AND ChangedByCustomerID IS NULL)
        OR (ChangedByActorType = 'Customer' AND ChangedByAdminUserID IS NULL AND ChangedByCustomerID IS NOT NULL)
        OR (ChangedByActorType = 'System' AND ChangedByAdminUserID IS NULL AND ChangedByCustomerID IS NULL)
    ),
    CONSTRAINT CK_CustomCakeQuoteHistory_Details CHECK (Details IS NULL OR ISJSON(Details) = 1)
);

CREATE TABLE DailyQuotaUsage (
    QuotaUsageID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    CategoryID INT REFERENCES ProductCategories(CategoryID),
    CakeID INT REFERENCES Cakes(CakeID),
    UsageDate DATE NOT NULL,
    AcceptedQuantity INT NOT NULL DEFAULT 0,
    QuotaLimit INT NOT NULL,
    AlertSent BIT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_DailyQuotaUsage UNIQUE (ProductionHouseID, CategoryID, CakeID, UsageDate),
    CONSTRAINT CK_DailyQuotaUsage_Values CHECK (AcceptedQuantity >= 0 AND QuotaLimit > 0)
);

CREATE TABLE DeliveryStatusHistory (
    DeliveryHistoryID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    DeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
    Status NVARCHAR(30) NOT NULL,
    Latitude DECIMAL(9,6),
    Longitude DECIMAL(9,6),
    ExceptionEvidenceURL NVARCHAR(1000),
    Notes NVARCHAR(500),
    RecordedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_DeliveryHistory_Status CHECK (Status IN ('Pending Assignment', 'Assigned', 'Accepted', 'Rejected', 'Timed Out', 'Picked Up', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled'))
);

CREATE TABLE DeliveryAssignments (
    DeliveryAssignmentID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    DeliveryPartnerID INT NOT NULL REFERENCES DeliveryPartners(DeliveryPartnerID),
    AssignmentMode NVARCHAR(10) NOT NULL,
    AttemptNumber INT NOT NULL,
    AssignmentStatus NVARCHAR(20) NOT NULL DEFAULT 'Offered',
    OfferedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    AcceptBy DATETIME2 NOT NULL,
    RespondedAt DATETIME2,
    RejectionReason NVARCHAR(500),
    AssignedByUserID INT REFERENCES AdminUsers(UserID),
    ReassignedFromID INT REFERENCES DeliveryAssignments(DeliveryAssignmentID),
    CONSTRAINT UQ_DeliveryAssignments_Attempt UNIQUE (OrderID, AttemptNumber),
    CONSTRAINT CK_DeliveryAssignments_Mode CHECK (AssignmentMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_DeliveryAssignments_Attempt CHECK (AttemptNumber > 0),
    CONSTRAINT CK_DeliveryAssignments_Status CHECK (AssignmentStatus IN ('Offered', 'Accepted', 'Rejected', 'Timed Out', 'Cancelled', 'Completed')),
    CONSTRAINT CK_DeliveryAssignments_Deadline CHECK (AcceptBy > OfferedAt)
);

CREATE TABLE NationwideShipments (
    NationwideShipmentID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    CarrierName NVARCHAR(150),
    TrackingNumber NVARCHAR(200),
    TrackingURL NVARCHAR(1000),
    ShipmentStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending Dispatch',
    EstimatedDeliveryDate DATE,
    DispatchedAt DATETIME2,
    DeliveredAt DATETIME2,
    FailureReason NVARCHAR(1000),
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_NationwideShipments_Status CHECK (ShipmentStatus IN ('Pending Dispatch', 'Booked', 'Dispatched', 'In Transit', 'Out for Delivery', 'Delivered', 'Delivery Failed', 'Returned', 'Cancelled')),
    CONSTRAINT CK_NationwideShipments_Tracking CHECK (
        ShipmentStatus IN ('Pending Dispatch', 'Cancelled')
        OR (CarrierName IS NOT NULL AND TrackingNumber IS NOT NULL)
    ),
    CONSTRAINT CK_NationwideShipments_Timestamps CHECK (
        (ShipmentStatus IN ('Pending Dispatch', 'Booked') AND DispatchedAt IS NULL AND DeliveredAt IS NULL)
        OR (ShipmentStatus = 'Cancelled' AND DeliveredAt IS NULL)
        OR (ShipmentStatus IN ('Dispatched', 'In Transit', 'Out for Delivery', 'Delivery Failed', 'Returned') AND DispatchedAt IS NOT NULL AND DeliveredAt IS NULL)
        OR (ShipmentStatus = 'Delivered' AND DispatchedAt IS NOT NULL AND DeliveredAt IS NOT NULL AND DeliveredAt >= DispatchedAt)
    ),
    CONSTRAINT CK_NationwideShipments_FailureReason CHECK (
        ShipmentStatus NOT IN ('Delivery Failed', 'Returned', 'Cancelled') OR FailureReason IS NOT NULL
    )
);

GO
CREATE TRIGGER TR_NationwideShipments_ValidateNYCCookiesOrder
ON NationwideShipments
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted shipment
        JOIN Orders orderRow ON orderRow.OrderID = shipment.OrderID
        JOIN ProductCategories category ON category.CategoryID = orderRow.CategoryID
        WHERE orderRow.FulfilmentMethod <> 'Nationwide-Delivery'
           OR category.CategoryCode <> 'GUNUCO_NYC_COOKIES'
    )
    BEGIN
        THROW 50016, 'Nationwide shipments are restricted to NYC Cookies nationwide-delivery orders.', 1;
    END;
END;
GO

CREATE TRIGGER TR_Orders_RequireNationwideShipmentDelivery
ON Orders
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted orderRow
        WHERE orderRow.FulfilmentMethod = 'Nationwide-Delivery'
          AND orderRow.OrderStatus = 'Delivered'
          AND NOT EXISTS (
              SELECT 1
              FROM NationwideShipments shipment
              WHERE shipment.OrderID = orderRow.OrderID
                AND shipment.ShipmentStatus = 'Delivered'
                AND shipment.DeliveredAt IS NOT NULL
          )
    )
    BEGIN
        THROW 50017, 'Nationwide orders require a delivered courier shipment before order completion.', 1;
    END;
END;
GO

GO
CREATE VIEW DeliveryPartnerAssignedOrderDetails AS
SELECT
    assignment.DeliveryAssignmentID,
    assignment.DeliveryPartnerID,
    assignment.AssignmentStatus,
    assignment.OfferedAt,
    assignment.AcceptBy,
    orderRow.LocationID,
    orderRow.ProductionHouseID,
    orderRow.CategoryID,
    orderRow.CustomerName,
    orderRow.CustomerPhone,
    orderRow.DeliveryAddress,
    orderRow.DestinationLatitude,
    orderRow.DestinationLongitude,
    orderRow.RouteDistanceKm,
    orderRow.RequestedDeliveryAt,
    orderRow.OrderStatus,
    orderRow.DeliveryStatus,
    orderRow.PaymentStatus,
    orderRow.DeliveryFee,
    orderRow.TotalAmount,
    orderRow.CreatedAt,
    orderRow.UpdatedAt
FROM DeliveryAssignments assignment
JOIN Orders orderRow ON orderRow.OrderID = assignment.OrderID
WHERE orderRow.FulfilmentMethod = 'Doorstep-Delivery';
GO

CREATE TABLE Payments (
    PaymentID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    IdempotencyKey UNIQUEIDENTIFIER NOT NULL,
    PaymentMethodID INT NOT NULL REFERENCES PaymentMethods(PaymentMethodID),
    Amount DECIMAL(10,2) NOT NULL,
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    GatewayTransactionID NVARCHAR(200),
    GatewayResponse NVARCHAR(MAX),
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    InitiatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CompletedAt DATETIME2,
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_Payments_Status CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded'))
);

CREATE TABLE PaymentGatewayEvents (
    PaymentGatewayEventID BIGINT PRIMARY KEY IDENTITY(1,1),
    ProviderName NVARCHAR(100) NOT NULL,
    ProviderEventID NVARCHAR(200) NOT NULL,
    PaymentID BIGINT REFERENCES Payments(PaymentID),
    EventType NVARCHAR(100) NOT NULL,
    SignatureVerified BIT NOT NULL DEFAULT 0,
    PayloadHash VARBINARY(32) NOT NULL,
    ProcessingStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    FailureReason NVARCHAR(1000),
    ReceivedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ProcessedAt DATETIME2,
    CONSTRAINT UQ_PaymentGatewayEvents_ProviderEvent UNIQUE (ProviderName, ProviderEventID),
    CONSTRAINT CK_PaymentGatewayEvents_Status CHECK (ProcessingStatus IN ('Pending', 'Processed', 'Ignored', 'Failed'))
);

CREATE TABLE PaymentTransactionHistory (
    PaymentTransactionHistoryID BIGINT PRIMARY KEY IDENTITY(1,1),
    PaymentID BIGINT NOT NULL REFERENCES Payments(PaymentID),
    PreviousStatus NVARCHAR(20),
    NewStatus NVARCHAR(20) NOT NULL,
    EventSource NVARCHAR(20) NOT NULL,
    PaymentGatewayEventID BIGINT REFERENCES PaymentGatewayEvents(PaymentGatewayEventID),
    ChangedByUserID INT REFERENCES AdminUsers(UserID),
    GatewayTransactionID NVARCHAR(200),
    AmountSnapshot DECIMAL(10,2) NOT NULL,
    FailureReason NVARCHAR(1000),
    CorrelationID UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_PaymentTransactionHistory_PreviousStatus CHECK (
        PreviousStatus IS NULL OR PreviousStatus IN ('Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded')
    ),
    CONSTRAINT CK_PaymentTransactionHistory_NewStatus CHECK (
        NewStatus IN ('Pending', 'Completed', 'Failed', 'Cancelled', 'Refunded', 'Partially Refunded')
    ),
    CONSTRAINT CK_PaymentTransactionHistory_Source CHECK (EventSource IN ('Application', 'Gateway', 'Admin', 'System')),
    CONSTRAINT CK_PaymentTransactionHistory_Amount CHECK (AmountSnapshot > 0)
);

CREATE TABLE POSSales (
    POSSaleID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    LocationID INT NOT NULL REFERENCES Locations(LocationID),
    CashierUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    ReceiptNumber NVARCHAR(30) NOT NULL UNIQUE,
    SaleStatus NVARCHAR(20) NOT NULL DEFAULT 'Completed',
    ReceiptGeneratedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ReceiptPrintedAt DATETIME2,
    ReceiptSharedAt DATETIME2,
    VoidedByUserID INT REFERENCES AdminUsers(UserID),
    VoidedAt DATETIME2,
    VoidReason NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_POSSales_Status CHECK (SaleStatus IN ('Completed', 'Voided', 'Refunded', 'Partially Refunded')),
    CONSTRAINT CK_POSSales_Void CHECK (
        (SaleStatus <> 'Voided' AND VoidedByUserID IS NULL AND VoidedAt IS NULL AND VoidReason IS NULL)
        OR (SaleStatus = 'Voided' AND VoidedByUserID IS NOT NULL AND VoidedAt IS NOT NULL AND VoidReason IS NOT NULL)
    )
);

ALTER TABLE POSCarts
ADD CONSTRAINT FK_POSCarts_ConvertedOrder
FOREIGN KEY (ConvertedOrderID) REFERENCES Orders(OrderID);

CREATE TABLE Offers (
    OfferID INT PRIMARY KEY IDENTITY(1,1),
    ProductionHouseID INT NOT NULL REFERENCES ProductionHouse(ProductionHouseID),
    OfferName NVARCHAR(150) NOT NULL,
    DiscountType NVARCHAR(20) NOT NULL,
    DiscountValue DECIMAL(10,2) NOT NULL,
    Scope NVARCHAR(30) NOT NULL,
    StartAt DATETIME2 NOT NULL,
    EndAt DATETIME2 NOT NULL,
    MaximumUsageCount INT,
    CurrentUsageCount INT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedByUserID INT REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Offers_Type CHECK (DiscountType IN ('Fixed Amount', 'Percentage')),
    CONSTRAINT CK_Offers_Value CHECK (DiscountValue > 0 AND (DiscountType <> 'Percentage' OR DiscountValue <= 100)),
    CONSTRAINT CK_Offers_Scope CHECK (Scope IN ('All Products', 'All Custom Cakes', 'Parent Category', 'Subcategory', 'Selected Products')),
    CONSTRAINT CK_Offers_Dates CHECK (EndAt > StartAt),
    CONSTRAINT CK_Offers_Usage CHECK (MaximumUsageCount IS NULL OR (MaximumUsageCount > 0 AND CurrentUsageCount BETWEEN 0 AND MaximumUsageCount))
);

CREATE TABLE OfferProducts (
    OfferID INT NOT NULL REFERENCES Offers(OfferID),
    ProductID INT NOT NULL REFERENCES Products(ProductID),
    PRIMARY KEY (OfferID, ProductID)
);

CREATE TABLE OfferCategories (
    OfferID INT NOT NULL REFERENCES Offers(OfferID),
    CategoryID INT NOT NULL REFERENCES ProductCategories(CategoryID),
    PRIMARY KEY (OfferID, CategoryID)
);

CREATE TABLE OrderOffers (
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    OfferID INT NOT NULL REFERENCES Offers(OfferID),
    DiscountAmountSnapshot DECIMAL(10,2) NOT NULL,
    AppliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (OrderID, OfferID),
    CONSTRAINT CK_OrderOffers_Discount CHECK (DiscountAmountSnapshot >= 0)
);

CREATE UNIQUE INDEX UX_OrderOffers_SingleOffer ON OrderOffers(OrderID);

CREATE TABLE Notifications (
    NotificationID BIGINT PRIMARY KEY IDENTITY(1,1),
    RecipientType NVARCHAR(30) NOT NULL,
    AdminUserID INT REFERENCES AdminUsers(UserID),
    DeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
    CustomerID BIGINT REFERENCES Customers(CustomerID),
    OrderID INT REFERENCES Orders(OrderID),
    CustomerPhone NVARCHAR(20),
    Channel NVARCHAR(20) NOT NULL,
    Subject NVARCHAR(200),
    Message NVARCHAR(2000) NOT NULL,
    NotificationStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    SentAt DATETIME2,
    FailureReason NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Notifications_Recipient CHECK (RecipientType IN ('Admin', 'Delivery Partner', 'Customer')),
    CONSTRAINT CK_Notifications_Channel CHECK (Channel IN ('In App', 'SMS', 'Email', 'Push')),
    CONSTRAINT CK_Notifications_Status CHECK (NotificationStatus IN ('Pending', 'Sent', 'Failed')),
    CONSTRAINT CK_Notifications_Target CHECK (
        (RecipientType = 'Admin' AND AdminUserID IS NOT NULL AND DeliveryPartnerID IS NULL AND CustomerID IS NULL)
        OR (RecipientType = 'Delivery Partner' AND AdminUserID IS NULL AND DeliveryPartnerID IS NOT NULL AND CustomerID IS NULL)
        OR (RecipientType = 'Customer' AND AdminUserID IS NULL AND DeliveryPartnerID IS NULL AND (CustomerID IS NOT NULL OR CustomerPhone IS NOT NULL))
    )
);

CREATE TABLE CustomerFeedbackRequests (
    CustomerFeedbackRequestID BIGINT PRIMARY KEY IDENTITY(1,1),
    CustomerID BIGINT NOT NULL REFERENCES Customers(CustomerID),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    PromptNotificationID BIGINT REFERENCES Notifications(NotificationID),
    RequestStatus NVARCHAR(20) NOT NULL DEFAULT 'Eligible',
    EligibleAt DATETIME2 NOT NULL,
    PromptedAt DATETIME2,
    OpenedAt DATETIME2,
    SubmittedAt DATETIME2,
    ExpiresAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_CustomerFeedbackRequests_Status CHECK (RequestStatus IN ('Eligible', 'Prompted', 'Opened', 'Submitted', 'Dismissed', 'Expired')),
    CONSTRAINT CK_CustomerFeedbackRequests_Dates CHECK (ExpiresAt IS NULL OR ExpiresAt > EligibleAt)
);

CREATE TABLE CustomerFeedback (
    CustomerFeedbackID BIGINT PRIMARY KEY IDENTITY(1,1),
    CustomerFeedbackRequestID BIGINT NOT NULL UNIQUE REFERENCES CustomerFeedbackRequests(CustomerFeedbackRequestID),
    CustomerID BIGINT NOT NULL REFERENCES Customers(CustomerID),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    FeedbackMessage NVARCHAR(2000) NOT NULL,
    TestimonialConsent BIT NOT NULL DEFAULT 0,
    ModerationStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    ModeratedByUserID INT REFERENCES AdminUsers(UserID),
    ModerationNotes NVARCHAR(1000),
    ModeratedAt DATETIME2,
    SubmittedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_CustomerFeedback_Message CHECK (LEN(LTRIM(RTRIM(FeedbackMessage))) BETWEEN 10 AND 2000),
    CONSTRAINT CK_CustomerFeedback_Status CHECK (ModerationStatus IN ('Pending', 'Approved', 'Rejected', 'Withdrawn')),
    CONSTRAINT CK_CustomerFeedback_Moderation CHECK (
        (ModerationStatus = 'Pending' AND ModeratedByUserID IS NULL AND ModeratedAt IS NULL)
        OR (ModerationStatus <> 'Pending' AND ModeratedByUserID IS NOT NULL AND ModeratedAt IS NOT NULL)
    )
);

CREATE TABLE Testimonials (
    TestimonialID BIGINT PRIMARY KEY IDENTITY(1,1),
    CustomerFeedbackID BIGINT NOT NULL UNIQUE REFERENCES CustomerFeedback(CustomerFeedbackID),
    DisplayName NVARCHAR(100) NOT NULL,
    QuoteSnapshot NVARCHAR(1000) NOT NULL,
    ImageURL NVARCHAR(1000) NOT NULL,
    ImageAltText NVARCHAR(250) NOT NULL,
    PublishToCustomerApp BIT NOT NULL DEFAULT 1,
    PublishToStaticWebsite BIT NOT NULL DEFAULT 1,
    DisplayOrder INT NOT NULL DEFAULT 0,
    IsPublished BIT NOT NULL DEFAULT 0,
    PublishFrom DATETIME2,
    PublishUntil DATETIME2,
    CreatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_Testimonials_Channel CHECK (PublishToCustomerApp = 1 OR PublishToStaticWebsite = 1),
    CONSTRAINT CK_Testimonials_Dates CHECK (PublishUntil IS NULL OR (PublishFrom IS NOT NULL AND PublishUntil > PublishFrom))
);

CREATE TABLE DeliveryEarnings (
    DeliveryEarningID BIGINT PRIMARY KEY IDENTITY(1,1),
    DeliveryPartnerID INT NOT NULL REFERENCES DeliveryPartners(DeliveryPartnerID),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    BaseEarning DECIMAL(10,2) NOT NULL,
    IncentiveAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    EarningStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    EarnedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PaidAt DATETIME2,
    CONSTRAINT CK_DeliveryEarnings_Amounts CHECK (BaseEarning >= 0 AND IncentiveAmount >= 0),
    CONSTRAINT CK_DeliveryEarnings_Status CHECK (EarningStatus IN ('Pending', 'Approved', 'Paid', 'Cancelled'))
);

CREATE TABLE Cancellations (
    CancellationID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL UNIQUE REFERENCES Orders(OrderID),
    CancelledByType NVARCHAR(20) NOT NULL,
    CancelledByUserID INT REFERENCES AdminUsers(UserID),
    CancelledByCustomerPhoneSnapshot NVARCHAR(20),
    Reason NVARCHAR(200) NOT NULL,
    Notes NVARCHAR(1000),
    OriginalAmount DECIMAL(10,2) NOT NULL,
    DeductionAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    RefundAmount DECIMAL(10,2) NOT NULL,
    CancellationPolicyID INT REFERENCES CancellationPolicies(CancellationPolicyID),
    CancellationWindowStartedAtSnapshot DATETIME2 NOT NULL,
    CancelledElapsedMinutes INT NOT NULL,
    RefundPercentageApplied DECIMAL(5,2) NOT NULL,
    EligibilityTier NVARCHAR(20) NOT NULL,
    NotifyBySMS BIT NOT NULL DEFAULT 1,
    NotifyByEmail BIT NOT NULL DEFAULT 0,
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_Cancellations_Amounts CHECK (OriginalAmount >= 0 AND DeductionAmount >= 0 AND RefundAmount >= 0 AND RefundAmount <= OriginalAmount),
    CONSTRAINT CK_Cancellations_Elapsed CHECK (CancelledElapsedMinutes >= 0),
    CONSTRAINT CK_Cancellations_Percentage CHECK (RefundPercentageApplied BETWEEN 0 AND 100),
    CONSTRAINT CK_Cancellations_Tier CHECK (EligibilityTier IN ('Full Refund', 'Partial Refund', 'Admin Exception')),
    CONSTRAINT CK_Cancellations_Actor CHECK (
        (CancelledByType = 'Customer' AND CancelledByUserID IS NULL AND CancelledByCustomerPhoneSnapshot IS NOT NULL)
        OR (CancelledByType = 'Admin' AND CancelledByUserID IS NOT NULL AND CancelledByCustomerPhoneSnapshot IS NULL)
        OR (CancelledByType = 'System' AND CancelledByUserID IS NULL AND CancelledByCustomerPhoneSnapshot IS NULL)
    )
);

CREATE TABLE GuidedSupportRules (
    GuidedSupportRuleID INT PRIMARY KEY IDENTITY(1,1),
    RuleCode NVARCHAR(100) NOT NULL,
    RuleVersion INT NOT NULL,
    Topic NVARCHAR(100) NOT NULL,
    RuleDefinition NVARCHAR(MAX) NOT NULL,
    ResponseTemplate NVARCHAR(2000) NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    EffectiveTo DATETIME2,
    CreatedByUserID INT NOT NULL REFERENCES AdminUsers(UserID),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_GuidedSupportRules_Version UNIQUE (RuleCode, RuleVersion),
    CONSTRAINT CK_GuidedSupportRules_Definition CHECK (ISJSON(RuleDefinition) = 1),
    CONSTRAINT CK_GuidedSupportRules_Dates CHECK (EffectiveTo IS NULL OR EffectiveTo > EffectiveFrom)
);

CREATE TABLE SupportTickets (
    SupportTicketID BIGINT PRIMARY KEY IDENTITY(1,1),
    PublicTicketID NVARCHAR(20) NOT NULL UNIQUE,
    TicketYearMonth INT NOT NULL,
    MonthlySequenceNumber INT NOT NULL,
    IdempotencyKey UNIQUEIDENTIFIER NOT NULL UNIQUE,
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20) NOT NULL,
    CustomerMessage NVARCHAR(2000) NOT NULL,
    EmailSubject NVARCHAR(300) NOT NULL,
    SourceChannel NVARCHAR(30) NOT NULL,
    MatchedGuidedSupportRuleID INT REFERENCES GuidedSupportRules(GuidedSupportRuleID),
    MatchedRuleCode NVARCHAR(100),
    MatchedRuleVersion INT,
    OrderStatusSnapshot NVARCHAR(40) NOT NULL,
    Priority NVARCHAR(20) NOT NULL DEFAULT 'Normal',
    TicketStatus NVARCHAR(30) NOT NULL DEFAULT 'New',
    AssignedSupportUserID INT REFERENCES CustomerSupportUsers(SupportUserID),
    EscalatedToAdminUserID INT REFERENCES AdminUsers(UserID),
    EscalatedAt DATETIME2,
    FirstResponseAt DATETIME2,
    ResolvedAt DATETIME2,
    ClosedAt DATETIME2,
    EmailStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    EmailSentAt DATETIME2,
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT UQ_SupportTickets_MonthlySequence UNIQUE (TicketYearMonth, MonthlySequenceNumber),
    CONSTRAINT CK_SupportTickets_PublicID CHECK (
        PublicTicketID = RIGHT(CONVERT(VARCHAR(4), TicketYearMonth / 100), 2)
            + RIGHT('0' + CONVERT(VARCHAR(2), TicketYearMonth % 100), 2) + '-'
            + CASE WHEN MonthlySequenceNumber < 10 THEN '0' ELSE '' END
            + CONVERT(VARCHAR(10), MonthlySequenceNumber)
    ),
    CONSTRAINT CK_SupportTickets_Channel CHECK (SourceChannel IN ('Guided Support', 'Application Support Form')),
    CONSTRAINT CK_SupportTickets_EmailSubject CHECK (EmailSubject LIKE '%Ticket %' AND EmailSubject LIKE '%Order %'),
    CONSTRAINT CK_SupportTickets_RuleSnapshot CHECK (
        (MatchedGuidedSupportRuleID IS NULL AND MatchedRuleCode IS NULL AND MatchedRuleVersion IS NULL)
        OR
        (MatchedGuidedSupportRuleID IS NOT NULL AND MatchedRuleCode IS NOT NULL AND MatchedRuleVersion IS NOT NULL AND MatchedRuleVersion > 0)
    ),
    CONSTRAINT CK_SupportTickets_Priority CHECK (Priority IN ('Low', 'Normal', 'High', 'Urgent')),
    CONSTRAINT CK_SupportTickets_Status CHECK (TicketStatus IN ('New', 'Open', 'Pending', 'Closed')),
    CONSTRAINT CK_SupportTickets_EmailStatus CHECK (EmailStatus IN ('Pending', 'Sent', 'Failed')),
    CONSTRAINT CK_SupportTickets_Escalation CHECK (
        (EscalatedToAdminUserID IS NULL AND EscalatedAt IS NULL)
        OR (EscalatedToAdminUserID IS NOT NULL AND EscalatedAt IS NOT NULL)
    )
);

CREATE TABLE SupportTicketAttachments (
    SupportTicketAttachmentID BIGINT PRIMARY KEY IDENTITY(1,1),
    SupportTicketID BIGINT NOT NULL REFERENCES SupportTickets(SupportTicketID),
    AttachmentPosition TINYINT NOT NULL,
    PrivateStorageKey NVARCHAR(1000) NOT NULL,
    OriginalFileName NVARCHAR(255) NOT NULL,
    ContentType NVARCHAR(50) NOT NULL,
    FileSizeBytes INT NOT NULL,
    UploadedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_SupportTicketAttachments_Position UNIQUE (SupportTicketID, AttachmentPosition),
    CONSTRAINT CK_SupportTicketAttachments_Position CHECK (AttachmentPosition BETWEEN 1 AND 3),
    CONSTRAINT CK_SupportTicketAttachments_Type CHECK (ContentType IN ('image/jpeg', 'image/png', 'image/webp')),
    CONSTRAINT CK_SupportTicketAttachments_Size CHECK (FileSizeBytes > 0 AND FileSizeBytes <= 5242880)
);

CREATE TABLE SupportTicketMessages (
    SupportTicketMessageID BIGINT PRIMARY KEY IDENTITY(1,1),
    SupportTicketID BIGINT NOT NULL REFERENCES SupportTickets(SupportTicketID),
    SenderType NVARCHAR(20) NOT NULL,
    SupportUserID INT REFERENCES CustomerSupportUsers(SupportUserID),
    AdminUserID INT REFERENCES AdminUsers(UserID),
    Message NVARCHAR(4000) NOT NULL,
    IsInternalNote BIT NOT NULL DEFAULT 0,
    EmailStatus NVARCHAR(20),
    SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketMessages_Sender CHECK (SenderType IN ('Customer', 'Guided Support', 'Support Agent', 'Admin', 'System')),
    CONSTRAINT CK_SupportTicketMessages_EmailStatus CHECK (EmailStatus IS NULL OR EmailStatus IN ('Pending', 'Sent', 'Failed')),
    CONSTRAINT CK_SupportTicketMessages_Actor CHECK (
        (SenderType = 'Support Agent' AND SupportUserID IS NOT NULL AND AdminUserID IS NULL)
        OR (SenderType = 'Admin' AND AdminUserID IS NOT NULL AND SupportUserID IS NULL)
        OR (SenderType IN ('Customer', 'Guided Support', 'System') AND SupportUserID IS NULL AND AdminUserID IS NULL)
    )
);

CREATE TABLE SupportTicketEmails (
    SupportTicketEmailID BIGINT PRIMARY KEY IDENTITY(1,1),
    SupportTicketID BIGINT NOT NULL REFERENCES SupportTickets(SupportTicketID),
    SupportTicketMessageID BIGINT REFERENCES SupportTicketMessages(SupportTicketMessageID),
    Direction NVARCHAR(10) NOT NULL,
    ProviderMessageID NVARCHAR(300),
    FromAddress NVARCHAR(254) NOT NULL,
    ToAddress NVARCHAR(254) NOT NULL,
    Subject NVARCHAR(300) NOT NULL,
    DeliveryStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    FailureReason NVARCHAR(1000),
    ReceivedAt DATETIME2,
    SentAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketEmails_Direction CHECK (Direction IN ('Inbound', 'Outbound')),
    CONSTRAINT CK_SupportTicketEmails_Status CHECK (DeliveryStatus IN ('Pending', 'Sent', 'Received', 'Failed', 'Bounced')),
    CONSTRAINT CK_SupportTicketEmails_Timestamps CHECK (
        (Direction = 'Inbound' AND ReceivedAt IS NOT NULL)
        OR (Direction = 'Outbound' AND ReceivedAt IS NULL)
    )
);

CREATE UNIQUE INDEX UX_SupportTicketEmails_ProviderMessageID
    ON SupportTicketEmails(ProviderMessageID) WHERE ProviderMessageID IS NOT NULL;

CREATE TABLE SupportTicketHistory (
    SupportTicketHistoryID BIGINT PRIMARY KEY IDENTITY(1,1),
    SupportTicketID BIGINT NOT NULL REFERENCES SupportTickets(SupportTicketID),
    SupportUserID INT REFERENCES CustomerSupportUsers(SupportUserID),
    AdminUserID INT REFERENCES AdminUsers(UserID),
    Action NVARCHAR(100) NOT NULL,
    PreviousStatus NVARCHAR(30),
    NewStatus NVARCHAR(30),
    Details NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketHistory_Details CHECK (Details IS NULL OR ISJSON(Details) = 1),
    CONSTRAINT CK_SupportTicketHistory_Actor CHECK (NOT (SupportUserID IS NOT NULL AND AdminUserID IS NOT NULL))
);

CREATE TABLE Returns (
    ReturnID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    Reason NVARCHAR(200) NOT NULL,
    IssueDescription NVARCHAR(1000),
    EvidenceURL NVARCHAR(1000),
    Severity NVARCHAR(20),
    Status NVARCHAR(30) NOT NULL DEFAULT 'Return Requested',
    ResolutionType NVARCHAR(30),
    ResolutionAmount DECIMAL(10,2),
    CustomerResponse NVARCHAR(1000),
    AdminNotes NVARCHAR(1000),
    ApprovedByUserID INT REFERENCES AdminUsers(UserID),
    ReplacementOrderID INT REFERENCES Orders(OrderID),
    RequestedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ResolvedAt DATETIME2,
    CONSTRAINT CK_Returns_Severity CHECK (Severity IS NULL OR Severity IN ('Low', 'Medium', 'High')),
    CONSTRAINT CK_Returns_Status CHECK (Status IN ('Return Requested', 'Approved', 'Rejected', 'Pending Customer Action', 'Escalated', 'Resolved')),
    CONSTRAINT CK_Returns_Resolution CHECK (ResolutionType IS NULL OR ResolutionType IN ('Full Refund', 'Partial Refund', 'Replacement', 'Store Credit', 'Rejected'))
);

CREATE TABLE Refunds (
    RefundID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    CancellationID INT REFERENCES Cancellations(CancellationID),
    ReturnID INT REFERENCES Returns(ReturnID),
    PaymentID BIGINT REFERENCES Payments(PaymentID),
    PaymentMethodID INT NOT NULL REFERENCES PaymentMethods(PaymentMethodID),
    IdempotencyKey UNIQUEIDENTIFIER NOT NULL UNIQUE,
    RefundAmount DECIMAL(10,2) NOT NULL,
    RefundStatus NVARCHAR(30) NOT NULL DEFAULT 'Pending',
    RetryAttempts INT NOT NULL DEFAULT 0,
    TransactionID NVARCHAR(100),
    FailureReason NVARCHAR(500),
    InitiatedByUserID INT REFERENCES AdminUsers(UserID),
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    InitiatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CompletedAt DATETIME2,
    CONSTRAINT CK_Refunds_Amount CHECK (RefundAmount > 0),
    CONSTRAINT CK_Refunds_Status CHECK (RefundStatus IN ('Pending', 'Processing', 'Completed', 'Failed', 'Manual Review')),
    CONSTRAINT CK_Refunds_Retries CHECK (RetryAttempts BETWEEN 0 AND 3)
);

CREATE TABLE RefundTransactionHistory (
    RefundTransactionHistoryID BIGINT PRIMARY KEY IDENTITY(1,1),
    RefundID INT NOT NULL REFERENCES Refunds(RefundID),
    PreviousStatus NVARCHAR(30),
    NewStatus NVARCHAR(30) NOT NULL,
    EventSource NVARCHAR(20) NOT NULL,
    ChangedByUserID INT REFERENCES AdminUsers(UserID),
    GatewayTransactionID NVARCHAR(200),
    RefundAmountSnapshot DECIMAL(10,2) NOT NULL,
    RetryAttempt INT NOT NULL DEFAULT 0,
    FailureReason NVARCHAR(1000),
    CorrelationID UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_RefundTransactionHistory_PreviousStatus CHECK (
        PreviousStatus IS NULL OR PreviousStatus IN ('Pending', 'Processing', 'Completed', 'Failed', 'Manual Review')
    ),
    CONSTRAINT CK_RefundTransactionHistory_NewStatus CHECK (
        NewStatus IN ('Pending', 'Processing', 'Completed', 'Failed', 'Manual Review')
    ),
    CONSTRAINT CK_RefundTransactionHistory_Source CHECK (EventSource IN ('Application', 'Gateway', 'Admin', 'System')),
    CONSTRAINT CK_RefundTransactionHistory_Amount CHECK (RefundAmountSnapshot > 0),
    CONSTRAINT CK_RefundTransactionHistory_Retry CHECK (RetryAttempt BETWEEN 0 AND 3)
);

CREATE TABLE ReturnedOrderItems (
    ReturnedOrderItemID BIGINT PRIMARY KEY IDENTITY(1,1),
    ReturnID INT NOT NULL REFERENCES Returns(ReturnID),
    OrderItemID INT NOT NULL REFERENCES OrderItems(OrderItemID),
    Quantity INT NOT NULL,
    DisposalStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending Disposal',
    DisposalMethod NVARCHAR(100),
    DisposedByUserID INT REFERENCES AdminUsers(UserID),
    DisposedAt DATETIME2,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT UQ_ReturnedOrderItems UNIQUE (ReturnID, OrderItemID),
    CONSTRAINT CK_ReturnedOrderItems_Quantity CHECK (Quantity > 0),
    CONSTRAINT CK_ReturnedOrderItems_Status CHECK (DisposalStatus IN ('Pending Disposal', 'Disposed')),
    CONSTRAINT CK_ReturnedOrderItems_Disposal CHECK (
        (DisposalStatus = 'Pending Disposal' AND DisposedByUserID IS NULL AND DisposedAt IS NULL)
        OR (DisposalStatus = 'Disposed' AND DisposedByUserID IS NOT NULL AND DisposedAt IS NOT NULL AND DisposalMethod IS NOT NULL)
    )
);

CREATE TABLE AuditLogs (
    AuditLogID BIGINT PRIMARY KEY IDENTITY(1,1),
    UserID INT REFERENCES AdminUsers(UserID),
    Action NVARCHAR(100) NOT NULL,
    EntityType NVARCHAR(50) NOT NULL,
    EntityID BIGINT,
    LocationID INT REFERENCES Locations(LocationID),
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    BeforeValues NVARCHAR(MAX),
    AfterValues NVARCHAR(MAX),
    Details NVARCHAR(MAX),
    IPAddress NVARCHAR(45),
    UserAgent NVARCHAR(500),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    ,CONSTRAINT CK_AuditLogs_BeforeValues CHECK (BeforeValues IS NULL OR ISJSON(BeforeValues) = 1)
    ,CONSTRAINT CK_AuditLogs_AfterValues CHECK (AfterValues IS NULL OR ISJSON(AfterValues) = 1)
);

CREATE TABLE OrderStatusHistory (
    OrderStatusHistoryID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    PreviousOrderStatus NVARCHAR(40),
    NewOrderStatus NVARCHAR(40) NOT NULL,
    PreviousDeliveryStatus NVARCHAR(30),
    NewDeliveryStatus NVARCHAR(30),
    PreviousPickupStatus NVARCHAR(30),
    NewPickupStatus NVARCHAR(30),
    ChangedByUserID INT REFERENCES AdminUsers(UserID),
    ChangedByDeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
    ChangeReason NVARCHAR(500),
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    ChangedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_OrderStatusHistory_Actor CHECK (
        NOT (ChangedByUserID IS NOT NULL AND ChangedByDeliveryPartnerID IS NOT NULL)
    )
);

CREATE TABLE OutboxMessages (
    OutboxMessageID BIGINT PRIMARY KEY IDENTITY(1,1),
    EventID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() UNIQUE,
    AggregateType NVARCHAR(100) NOT NULL,
    AggregateID NVARCHAR(100) NOT NULL,
    EventType NVARCHAR(150) NOT NULL,
    Payload NVARCHAR(MAX) NOT NULL,
    CorrelationID UNIQUEIDENTIFIER NOT NULL,
    ProcessingStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    AttemptCount INT NOT NULL DEFAULT 0,
    AvailableAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    ProcessedAt DATETIME2,
    LastError NVARCHAR(2000),
    CONSTRAINT CK_OutboxMessages_Payload CHECK (ISJSON(Payload) = 1),
    CONSTRAINT CK_OutboxMessages_Status CHECK (ProcessingStatus IN ('Pending', 'Processing', 'Processed', 'Failed')),
    CONSTRAINT CK_OutboxMessages_Attempts CHECK (AttemptCount >= 0)
);

CREATE INDEX IX_Orders_Status_Delivery ON Orders(OrderStatus, RequestedDeliveryAt);
CREATE INDEX IX_Orders_Category_RequestedDelivery ON Orders(CategoryID, RequestedDeliveryAt, OrderStatus);
CREATE INDEX IX_ProductCategories_POSBrowse ON ProductCategories(ParentCategoryID, IsActive, IsAvailable, DisplayOrder);
CREATE INDEX IX_Products_CategoryBrowse ON Products(CategoryID, IsAvailable, ProductName);
CREATE INDEX IX_Products_MenuManagement ON Products(CategoryID, PublicationStatus, DisplayOrder, ProductName);
CREATE INDEX IX_ProductImages_Product ON ProductImages(ProductID, IsActive, DisplayOrder);
CREATE INDEX IX_LocationProductAvailability_POSBrowse ON LocationProductAvailability(LocationID, IsAvailable, ProductID);
CREATE INDEX IX_POSCarts_OperatorStatus ON POSCarts(CreatedByAdminUserID, LocationID, CartStatus, UpdatedAt DESC);
CREATE INDEX IX_POSCartItems_Cart ON POSCartItems(POSCartID, POSCartItemID);
CREATE INDEX IX_Orders_Customer ON Orders(CustomerID, CreatedAt DESC);
CREATE INDEX IX_Orders_CustomerPhone ON Orders(CustomerPhone);
CREATE INDEX IX_CustomerOTPChallenges_Phone ON CustomerOTPChallenges(PhoneE164, Purpose, CreatedAt DESC);
CREATE INDEX IX_CustomerSessions_Active ON CustomerSessions(CustomerID, ExpiresAt) WHERE RevokedAt IS NULL;
CREATE INDEX IX_CustomerAddresses_Customer ON CustomerAddresses(CustomerID, IsActive);
CREATE INDEX IX_OrderItems_OrderID ON OrderItems(OrderID);
CREATE INDEX IX_OrderItemPriceComponents_OrderItem ON OrderItemPriceComponents(OrderItemID, DisplayOrder);
CREATE INDEX IX_DeliveryHistory_OrderID ON DeliveryStatusHistory(OrderID, RecordedAt);
CREATE INDEX IX_Orders_DeliveryStatus ON Orders(DeliveryStatus, RequestedDeliveryAt);
CREATE INDEX IX_Orders_FulfilmentMethod ON Orders(FulfilmentMethod, RequestedDeliveryAt);
CREATE INDEX IX_OrderIDValidations_Order ON OrderIDValidations(OrderID, ValidatedAt DESC);
CREATE INDEX IX_DeliveryFeeRules_Lookup ON DeliveryFeeRules(ProductionHouseID, CategoryID, IsAvailable, MaximumDistanceInclusiveKm);
CREATE INDEX IX_DeliveryAssignments_Order ON DeliveryAssignments(OrderID, AttemptNumber);
CREATE INDEX IX_DeliveryAssignments_PartnerStatus ON DeliveryAssignments(DeliveryPartnerID, AssignmentStatus, AcceptBy);
CREATE INDEX IX_Payments_OrderStatus ON Payments(OrderID, PaymentStatus);
CREATE INDEX IX_PaymentTransactionHistory_Payment ON PaymentTransactionHistory(PaymentID, CreatedAt);
CREATE UNIQUE INDEX UX_Orders_CheckoutIdempotencyKey ON Orders(CheckoutIdempotencyKey) WHERE CheckoutIdempotencyKey IS NOT NULL;
CREATE UNIQUE INDEX UX_Payments_IdempotencyKey ON Payments(IdempotencyKey);
CREATE INDEX IX_PaymentGatewayEvents_Status ON PaymentGatewayEvents(ProcessingStatus, ReceivedAt);
CREATE INDEX IX_Orders_SalesChannel ON Orders(SalesChannel, CreatedAt);
CREATE INDEX IX_Orders_LocationChannel ON Orders(LocationID, SalesChannel, CreatedAt);
CREATE INDEX IX_POSSales_CashierDate ON POSSales(CashierUserID, CreatedAt);
CREATE INDEX IX_POSSales_LocationDate ON POSSales(LocationID, CreatedAt);
CREATE INDEX IX_LocationCategorySettings_Lookup ON LocationCategorySettings(LocationID, CategoryID, IsAvailable);
CREATE INDEX IX_CancellationPolicies_Lookup ON CancellationPolicies(ProductionHouseID, LocationID, CategoryID, IsActive, EffectiveFrom);
CREATE INDEX IX_ProductCategories_Parent ON ProductCategories(ParentCategoryID, IsActive, DisplayOrder);
CREATE INDEX IX_AddOnCategoryAssignments_Category ON AddOnCategoryAssignments(CategoryID, AddOnID);
CREATE INDEX IX_AddOnProductAssignments_Product ON AddOnProductAssignments(ProductID, AddOnID);
CREATE INDEX IX_LocationAddOnAvailability_Lookup ON LocationAddOnAvailability(LocationID, IsAvailable, AddOnID);
CREATE INDEX IX_OrderItemAddOns_OrderItem ON OrderItemAddOns(OrderItemID);
CREATE INDEX IX_Offers_ActiveWindow ON Offers(IsAvailable, StartAt, EndAt);
CREATE INDEX IX_Notifications_Status ON Notifications(NotificationStatus, CreatedAt);
CREATE INDEX IX_CustomerPushDevices_Active ON CustomerPushDevices(CustomerID, IsActive, LastSeenAt DESC);
CREATE INDEX IX_CustomerFeedbackRequests_Due ON CustomerFeedbackRequests(RequestStatus, EligibleAt);
CREATE INDEX IX_CustomerFeedback_Moderation ON CustomerFeedback(ModerationStatus, SubmittedAt);
CREATE INDEX IX_Testimonials_Published ON Testimonials(IsPublished, PublishToCustomerApp, PublishToStaticWebsite, DisplayOrder);
CREATE INDEX IX_DeliveryEarnings_PartnerStatus ON DeliveryEarnings(DeliveryPartnerID, EarningStatus, EarnedAt);
CREATE INDEX IX_Refunds_Status ON Refunds(RefundStatus);
CREATE INDEX IX_RefundTransactionHistory_Refund ON RefundTransactionHistory(RefundID, CreatedAt);
CREATE INDEX IX_Returns_Status ON Returns(Status);
CREATE INDEX IX_SupportTickets_Dashboard ON SupportTickets(TicketStatus, Priority, UpdatedAt DESC);
CREATE INDEX IX_SupportTickets_Order ON SupportTickets(OrderID, CreatedAt DESC);
CREATE INDEX IX_SupportTickets_Assignee ON SupportTickets(AssignedSupportUserID, TicketStatus, UpdatedAt DESC);
CREATE INDEX IX_SupportTickets_AdminEscalation ON SupportTickets(EscalatedToAdminUserID, TicketStatus, UpdatedAt DESC)
    WHERE EscalatedToAdminUserID IS NOT NULL;
CREATE INDEX IX_CustomerSupportUsers_Assignment ON CustomerSupportUsers(Status, IsAvailableForAssignment, AccessExpiresAt, LastAssignedAt);
CREATE INDEX IX_CustomerSupportSessions_Active ON CustomerSupportSessions(SupportUserID, ExpiresAt) WHERE RevokedAt IS NULL;
CREATE INDEX IX_SupportTicketMessages_Ticket ON SupportTicketMessages(SupportTicketID, SentAt);
CREATE INDEX IX_SupportTicketHistory_Ticket ON SupportTicketHistory(SupportTicketID, CreatedAt);
CREATE INDEX IX_OrderStatusHistory_Order ON OrderStatusHistory(OrderID, ChangedAt DESC);
CREATE INDEX IX_CustomCakeQuoteHistory_OrderItem ON CustomCakeQuoteHistory(OrderItemID, ChangedAt DESC);
CREATE INDEX IX_OutboxMessages_Dispatch ON OutboxMessages(ProcessingStatus, AvailableAt, OutboxMessageID);
CREATE INDEX IX_NYCCookiesStateDeliveryAvailability_State ON NYCCookiesStateDeliveryAvailability(StateCode, IsAvailable, CategoryID);
CREATE INDEX IX_NationwideShipments_Status ON NationwideShipments(ShipmentStatus, EstimatedDeliveryDate, UpdatedAt DESC);

INSERT INTO IndianStatesAndUnionTerritories (StateCode, StateName, RegionType, DisplayOrder)
VALUES
    ('AP', 'Andhra Pradesh', 'State', 1),
    ('AR', 'Arunachal Pradesh', 'State', 2),
    ('AS', 'Assam', 'State', 3),
    ('BR', 'Bihar', 'State', 4),
    ('CG', 'Chhattisgarh', 'State', 5),
    ('GA', 'Goa', 'State', 6),
    ('GJ', 'Gujarat', 'State', 7),
    ('HR', 'Haryana', 'State', 8),
    ('HP', 'Himachal Pradesh', 'State', 9),
    ('JH', 'Jharkhand', 'State', 10),
    ('KA', 'Karnataka', 'State', 11),
    ('KL', 'Kerala', 'State', 12),
    ('MP', 'Madhya Pradesh', 'State', 13),
    ('MH', 'Maharashtra', 'State', 14),
    ('MN', 'Manipur', 'State', 15),
    ('ML', 'Meghalaya', 'State', 16),
    ('MZ', 'Mizoram', 'State', 17),
    ('NL', 'Nagaland', 'State', 18),
    ('OD', 'Odisha', 'State', 19),
    ('PB', 'Punjab', 'State', 20),
    ('RJ', 'Rajasthan', 'State', 21),
    ('SK', 'Sikkim', 'State', 22),
    ('TN', 'Tamil Nadu', 'State', 23),
    ('TS', 'Telangana', 'State', 24),
    ('TR', 'Tripura', 'State', 25),
    ('UP', 'Uttar Pradesh', 'State', 26),
    ('UK', 'Uttarakhand', 'State', 27),
    ('WB', 'West Bengal', 'State', 28),
    ('AN', 'Andaman and Nicobar Islands', 'Union Territory', 29),
    ('CH', 'Chandigarh', 'Union Territory', 30),
    ('DN', 'Dadra and Nagar Haveli and Daman and Diu', 'Union Territory', 31),
    ('DL', 'Delhi', 'Union Territory', 32),
    ('JK', 'Jammu and Kashmir', 'Union Territory', 33),
    ('LA', 'Ladakh', 'Union Territory', 34),
    ('LD', 'Lakshadweep', 'Union Territory', 35),
    ('PY', 'Puducherry', 'Union Territory', 36);

INSERT INTO ProductCategories (CategoryCode, CategoryName, CategoryType, IsActive, IsAvailable, DisplayOrder)
VALUES
    ('CAKES', 'Cakes', 'Cake', 1, 1, 1),
    ('COFFEE', 'Coffee', 'Beverage', 0, 0, 2),
    ('PIZZA', 'Pizza', 'General Food', 0, 0, 3),
    ('BURGERS', 'Burgers', 'General Food', 0, 0, 4);

DECLARE @CakesCategoryID INT = (SELECT CategoryID FROM ProductCategories WHERE CategoryCode = 'CAKES');

INSERT INTO ProductCategories (
    ParentCategoryID, CategoryCode, CategoryName, CategoryType, IsActive, IsAvailable, DisplayOrder,
    MinimumOrderLeadTimeHours, MaximumAdvanceOrderHours, SameDayDeliveryEnabled
) VALUES
    (@CakesCategoryID, 'GUNUCO_PREMIUM_CAKES', 'GUNUCO PREMIUM CAKES', 'Cake', 1, 1, 1, NULL, NULL, 0),
    (@CakesCategoryID, 'GUNUCO_CHEESE_CAKES', 'GUNUCO CHEESE CAKES', 'Cake', 1, 1, 2, NULL, NULL, 0),
    (@CakesCategoryID, 'GUNUCO_BROWNIES', 'GUNUCO BROWNIES', 'General Food', 1, 1, 3, NULL, NULL, 0),
    (@CakesCategoryID, 'GUNUCO_NYC_COOKIES', 'GUNUCO NYC COOKIES', 'General Food', 1, 1, 4, NULL, NULL, 0),
    (@CakesCategoryID, 'CASUAL_CAKES', 'CASUAL CAKES', 'Cake', 1, 1, 5, NULL, NULL, 0),
    (@CakesCategoryID, 'WEDDING_ANNIVERSARY_CAKES', 'WEDDING OR ANNIVERSARY CAKES', 'Cake', 1, 1, 6, 72, 720, 0),
    (@CakesCategoryID, 'OCCASIONAL_CAKES', 'OCCASIONAL CAKES', 'Cake', 1, 1, 7, NULL, NULL, 0);

DECLARE @NYCCookiesCategoryID INT = (SELECT CategoryID FROM ProductCategories WHERE CategoryCode = 'GUNUCO_NYC_COOKIES');

INSERT INTO NYCCookiesDeliverySettings (CategoryID, RegularCityDeliveryEnabled, AllIndiaDeliveryEnabled)
VALUES (@NYCCookiesCategoryID, 1, 0);

INSERT INTO CustomizationTypes (CustomizationCode, DisplayName, DisplayOrder) VALUES
    ('FLAVOUR', 'Flavour Type', 1),
    ('EGG_PREFERENCE', 'Egg or Eggless', 2),
    ('SWEETENER_TYPE', 'Sweetener Type', 3),
    ('FLOUR_TYPE', 'Flour Type', 4),
    ('SIZE_WEIGHT', 'Size or Weight', 5);

INSERT INTO CategoryCustomizationSettings (CategoryID, CustomizationTypeID, SettingMode)
SELECT @CakesCategoryID, customization.CustomizationTypeID, 'OFF'
FROM CustomizationTypes customization;

INSERT INTO CategoryCustomizationSettings (CategoryID, CustomizationTypeID, SettingMode)
SELECT category.CategoryID, customization.CustomizationTypeID,
    CASE WHEN category.CategoryCode IN ('CASUAL_CAKES', 'WEDDING_ANNIVERSARY_CAKES', 'OCCASIONAL_CAKES') THEN 'ON' ELSE 'OFF' END
FROM ProductCategories category
CROSS JOIN CustomizationTypes customization
WHERE category.ParentCategoryID = @CakesCategoryID;

INSERT INTO CategoryQuantitySettings (CategoryID, SettingMode, MinimumQuantity, MaximumQuantity, DefaultQuantity)
VALUES (@CakesCategoryID, 'Override', 1, 99, 1);

INSERT INTO CategoryQuantitySettings (CategoryID, SettingMode)
SELECT category.CategoryID, 'Inherit'
FROM ProductCategories category
WHERE category.ParentCategoryID = @CakesCategoryID;
UPDATE ProductCategories
SET SameDayDeliveryEnabled = 1,
    SameDayCutoffTime = '14:00',
    MinimumPreparationMinutes = 120,
    SameDaySlotCapacity = 50
WHERE CategoryName = 'Cakes';
INSERT INTO EggPreferences (PreferenceName) VALUES ('Egg'), ('Eggless');
INSERT INTO SugarTypes (SugarTypeName) VALUES ('Mishri'), ('Stevia'), ('Regular Sugar'), ('Less Sugar'), ('Jaggery'), ('Sugar-Free'), ('Others');
INSERT INTO FlourTypes (FlourTypeName) VALUES ('Maida'), ('Wheat Flour');
INSERT INTO Sizes (SizeName, WeightInGrams, AllowedForCatalogue, AllowedForCustomCake) VALUES
    ('500g', 500, 1, 1),
    ('1kg', 1000, 1, 1),
    ('2kg', 2000, 1, 1),
    ('3kg', 3000, 1, 1),
    ('4kg', 4000, 0, 1),
    ('5kg', 5000, 0, 1),
    ('6kg', 6000, 0, 1),
    ('7kg', 7000, 0, 1),
    ('8kg', 8000, 0, 1),
    ('9kg', 9000, 0, 1),
    ('10kg', 10000, 0, 1);
INSERT INTO Sizes (SizeName, AllowedForCustomCake, RequiresManualQuote)
VALUES ('Above 10kg', 1, 1);
INSERT INTO PaymentMethods (MethodName, IsAvailable)
VALUES ('Card', 1), ('UPI', 1), ('Net Banking', 1), ('Wallet', 0), ('Store Credit', 0);