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
    CustomCakeMinimumLeadTimeHours INT NOT NULL DEFAULT 72,
    CustomCakeMaximumScheduleHours INT NOT NULL DEFAULT 720,
    DeliveryAssignmentMode NVARCHAR(10) NOT NULL DEFAULT 'Automatic',
    DeliveryAssignmentTimeoutMinutes INT NOT NULL DEFAULT 2,
    Status NVARCHAR(20) NOT NULL DEFAULT 'Active',
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_ProductionHouse_Status CHECK (Status IN ('Active', 'Inactive', 'Suspended')),
    CONSTRAINT CK_ProductionHouse_CakesMode CHECK (CakesAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_PremiumMode CHECK (PremiumAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_CustomCakesMode CHECK (CustomCakesAcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_ProductionHouse_DailyLimit CHECK (DailyOrderLimit IS NULL OR DailyOrderLimit > 0),
    CONSTRAINT CK_ProductionHouse_LeadTime CHECK (
        CustomCakeMinimumLeadTimeHours >= 72
        AND CustomCakeMaximumScheduleHours <= 720
        AND CustomCakeMaximumScheduleHours > CustomCakeMinimumLeadTimeHours
    )
    ,CONSTRAINT CK_ProductionHouse_DeliveryMode CHECK (DeliveryAssignmentMode IN ('Automatic', 'Manual'))
    ,CONSTRAINT CK_ProductionHouse_AssignmentTimeout CHECK (DeliveryAssignmentTimeoutMinutes > 0)
    ,CONSTRAINT CK_ProductionHouse_Coordinates CHECK (
        (Latitude IS NULL AND Longitude IS NULL)
        OR (Latitude BETWEEN -90 AND 90 AND Longitude BETWEEN -180 AND 180)
    )
    ,CONSTRAINT CK_ProductionHouse_DeliveryDistance CHECK (MaximumDoorstepDistanceKm > 0)
    ,CONSTRAINT CK_ProductionHouse_ReturnWindow CHECK (ReturnWindowHours > 0)
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
    CONSTRAINT CK_AdminUsers_Role CHECK (Role IN ('Owner Admin', 'Main Admin', 'Branch Admin')),
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
    IsActive BIT NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 0,
    DisplayOrder INT NOT NULL DEFAULT 0,
    DailyQuota INT,
    SameDayDeliveryEnabled BIT NOT NULL DEFAULT 0,
    SameDayCutoffTime TIME,
    MinimumPreparationMinutes INT,
    SameDaySlotCapacity INT,
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
    CONSTRAINT CK_ProductCategories_Parent CHECK (ParentCategoryID IS NULL OR ParentCategoryID <> CategoryID)
);

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
    Description NVARCHAR(1000),
    ProductImageURL NVARCHAR(1000),
    BasePrice DECIMAL(10,2) NOT NULL,
    ProductOptionSchema NVARCHAR(MAX),
    IsAvailable BIT NOT NULL DEFAULT 1,
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    RowVersion ROWVERSION,
    CONSTRAINT CK_Products_BasePrice CHECK (BasePrice >= 0),
    CONSTRAINT CK_Products_OptionSchema CHECK (ProductOptionSchema IS NULL OR ISJSON(ProductOptionSchema) = 1)
);

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
    SizeID INT NOT NULL REFERENCES Sizes(SizeID),
    IngredientPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, FlavourID, SizeID)
);

CREATE TABLE CakeEggPreferences (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    EggPreferenceID INT NOT NULL REFERENCES EggPreferences(EggPreferenceID),
    SizeID INT NOT NULL REFERENCES Sizes(SizeID),
    IngredientPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, EggPreferenceID, SizeID)
);

CREATE TABLE CakeSugarTypes (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    SugarTypeID INT NOT NULL REFERENCES SugarTypes(SugarTypeID),
    SizeID INT NOT NULL REFERENCES Sizes(SizeID),
    IngredientPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, SugarTypeID, SizeID)
);

CREATE TABLE CakeFlourTypes (
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    FlourTypeID INT NOT NULL REFERENCES FlourTypes(FlourTypeID),
    SizeID INT NOT NULL REFERENCES Sizes(SizeID),
    IngredientPriceContribution DECIMAL(10,2) NOT NULL DEFAULT 0,
    IsAvailable BIT NOT NULL DEFAULT 1,
    EffectiveFrom DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (CakeID, FlourTypeID, SizeID)
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
    DefaultFlavourID INT NOT NULL REFERENCES Flavours(FlavourID),
    DefaultEggPreferenceID INT NOT NULL REFERENCES EggPreferences(EggPreferenceID),
    DefaultSugarTypeID INT NOT NULL REFERENCES SugarTypes(SugarTypeID),
    DefaultFlourTypeID INT NOT NULL REFERENCES FlourTypes(FlourTypeID),
    DefaultSizeID INT NOT NULL REFERENCES Sizes(SizeID),
    DefaultQuantity INT NOT NULL DEFAULT 1,
    UpdatedByUserID INT REFERENCES AdminUsers(UserID),
    UpdatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_CakeDefaultSelections_Quantity CHECK (DefaultQuantity > 0)
);

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
    CustomerName NVARCHAR(100) NOT NULL,
    CustomerPhone NVARCHAR(20),
    CustomerEmail NVARCHAR(100),
    FulfilmentMethod NVARCHAR(30) NOT NULL,
    DeliveryAddress NVARCHAR(500),
    DestinationLatitude DECIMAL(9,6),
    DestinationLongitude DECIMAL(9,6),
    RouteDistanceKm DECIMAL(8,3),
    DeliveryFeeRuleID INT,
    DeliveryFeeCalculatedAt DATETIME2,
    DeliveryFeeMinimumDistanceSnapshotKm DECIMAL(8,3),
    DeliveryFeeMaximumDistanceSnapshotKm DECIMAL(8,3),
    DeliveryFeeAmountSnapshot DECIMAL(10,2),
    PickupStatus NVARCHAR(30) NOT NULL DEFAULT 'Not Applicable',
    CollectedByName NVARCHAR(100),
    CollectedAt DATETIME2,
    RequestedDeliveryAt DATETIME2 NOT NULL,
    OrderStatus NVARCHAR(40) NOT NULL DEFAULT 'Not Accepted',
    PaymentMethodID INT REFERENCES PaymentMethods(PaymentMethodID),
    PaymentPlan NVARCHAR(30),
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
    BalanceDue AS (TotalAmount - AmountPaid) PERSISTED,
    BalancePaymentDueAt DATETIME2,
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
        (SalesChannel = 'Online' AND CreatedByAdminUserID IS NULL AND POSExceptionReason IS NULL AND CustomerPhone IS NOT NULL)
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
    CONSTRAINT CK_Orders_FulfilmentMethod CHECK (FulfilmentMethod IN ('Pickup-at-Store', 'Doorstep-Delivery')),
    CONSTRAINT CK_Orders_FulfilmentDetails CHECK (
        (FulfilmentMethod = 'Pickup-at-Store'
            AND DeliveryAddress IS NULL AND DestinationLatitude IS NULL AND DestinationLongitude IS NULL AND RouteDistanceKm IS NULL
            AND DeliveryFee = 0 AND DeliveryFeeRuleID IS NULL AND DeliveryFeeCalculatedAt IS NULL
            AND DeliveryFeeMinimumDistanceSnapshotKm IS NULL AND DeliveryFeeMaximumDistanceSnapshotKm IS NULL AND DeliveryFeeAmountSnapshot IS NULL
            AND DeliveryPartnerID IS NULL AND DeliveryAssignmentMode IS NULL AND DeliveryStatus = 'Not Required')
        OR
        (FulfilmentMethod = 'Doorstep-Delivery'
            AND DeliveryAddress IS NOT NULL AND DestinationLatitude IS NOT NULL AND DestinationLongitude IS NOT NULL AND RouteDistanceKm IS NOT NULL
            AND DeliveryFeeRuleID IS NOT NULL AND DeliveryFeeCalculatedAt IS NOT NULL
            AND DeliveryAssignmentMode IS NOT NULL AND DeliveryStatus <> 'Not Required' AND PickupStatus = 'Not Applicable')
    ),
    CONSTRAINT CK_Orders_AcceptanceMode CHECK (AcceptanceMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_Orders_AcceptanceActor CHECK ((AcceptedAutomatically = 1 AND AcceptedByUserID IS NULL) OR AcceptedAutomatically = 0),
    CONSTRAINT CK_Orders_DeliveryStatus CHECK (DeliveryStatus IN ('Not Required', 'Not Started', 'Pending Assignment', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered', 'Failed', 'Cancelled')),
    CONSTRAINT CK_Orders_DeliveryMode CHECK (DeliveryAssignmentMode IS NULL OR DeliveryAssignmentMode IN ('Automatic', 'Manual')),
    CONSTRAINT CK_Orders_PickupStatus CHECK (PickupStatus IN ('Not Applicable', 'Pickup Scheduled', 'Ready for Pickup', 'Collected', 'Cancelled')),
    CONSTRAINT CK_Orders_PickupStatusForFulfilment CHECK (
        (FulfilmentMethod = 'Pickup-at-Store' AND PickupStatus <> 'Not Applicable')
        OR (FulfilmentMethod = 'Doorstep-Delivery' AND PickupStatus = 'Not Applicable')
    ),
    CONSTRAINT CK_Orders_Collection CHECK (PickupStatus <> 'Collected' OR (CollectedByName IS NOT NULL AND CollectedAt IS NOT NULL)),
    CONSTRAINT CK_Orders_PaymentPlan CHECK (PaymentPlan IS NULL OR PaymentPlan IN ('Full Payment', '50% Advance + 50% Balance')),
    CONSTRAINT CK_Orders_PaymentStatus CHECK (PaymentStatus IN ('Pending', 'Partially Paid', 'Completed', 'Failed', 'Refunded', 'Partially Refunded')),
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
    CONSTRAINT CK_Orders_PaymentPlanState CHECK (
        (PaymentStatus = 'Pending' AND AmountPaid = 0)
        OR (PaymentStatus = 'Partially Paid' AND PaymentPlan = '50% Advance + 50% Balance' AND AmountPaid = ROUND(TotalAmount / 2, 2) AND BalancePaymentDueAt IS NOT NULL AND BalancePaymentDueAt <= RequestedDeliveryAt)
        OR (PaymentStatus = 'Completed' AND PaymentPlan IS NOT NULL AND AmountPaid = TotalAmount)
        OR PaymentStatus IN ('Failed', 'Refunded', 'Partially Refunded')
    ),
    CONSTRAINT CK_Orders_ProductionPaymentGate CHECK (
        OrderStatus NOT IN ('Accepted', 'Preparing', 'Packed', 'Ready for Delivery', 'Delivery Partner Assigning', 'Assigned', 'Picked Up', 'Out for Delivery', 'Delivered')
        OR PaymentStatus IN ('Partially Paid', 'Completed', 'Refunded', 'Partially Refunded')
    ),
    CONSTRAINT CK_Orders_BalanceHandoverGate CHECK (
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
    ),
    CONSTRAINT CK_Orders_CompletedAt CHECK (
        (CompletedAt IS NULL AND OrderStatus NOT IN ('Delivered', 'Cancelled', 'Resolved') AND PickupStatus <> 'Collected')
        OR (CompletedAt IS NOT NULL AND (OrderStatus IN ('Delivered', 'Cancelled', 'Resolved') OR PickupStatus = 'Collected'))
    )
);

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
    QuoteApprovedAt DATETIME2,
    OneKgCalculatedPrice DECIMAL(10,2),
    WeightMultiplier DECIMAL(6,3),
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
    ,CONSTRAINT CK_CustomCakeDetails_Multiplier CHECK (WeightMultiplier IS NULL OR WeightMultiplier > 0)
    ,CONSTRAINT CK_CustomCakeDetails_AdjustmentReason CHECK (ManualPriceAdjustment = 0 OR ManualAdjustmentReason IS NOT NULL)
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

CREATE TABLE Payments (
    PaymentID BIGINT PRIMARY KEY IDENTITY(1,1),
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    IdempotencyKey UNIQUEIDENTIFIER NOT NULL,
    PaymentMethodID INT NOT NULL REFERENCES PaymentMethods(PaymentMethodID),
    PaymentStage NVARCHAR(20) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentStatus NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    GatewayTransactionID NVARCHAR(200),
    GatewayResponse NVARCHAR(MAX),
    CorrelationID UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    InitiatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CompletedAt DATETIME2,
    CONSTRAINT CK_Payments_Amount CHECK (Amount > 0),
    CONSTRAINT CK_Payments_Stage CHECK (PaymentStage IN ('Full', 'Advance', 'Balance')),
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
    CONSTRAINT CK_Offers_Scope CHECK (Scope IN ('All Cakes', 'All Custom Cakes', 'Selected Cakes')),
    CONSTRAINT CK_Offers_Dates CHECK (EndAt > StartAt),
    CONSTRAINT CK_Offers_Usage CHECK (MaximumUsageCount IS NULL OR (MaximumUsageCount > 0 AND CurrentUsageCount BETWEEN 0 AND MaximumUsageCount))
);

CREATE TABLE OfferProducts (
    OfferID INT NOT NULL REFERENCES Offers(OfferID),
    CakeID INT NOT NULL REFERENCES Cakes(CakeID),
    PRIMARY KEY (OfferID, CakeID)
);

CREATE TABLE OrderOffers (
    OrderID INT NOT NULL REFERENCES Orders(OrderID),
    OfferID INT NOT NULL REFERENCES Offers(OfferID),
    DiscountAmountSnapshot DECIMAL(10,2) NOT NULL,
    AppliedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    PRIMARY KEY (OrderID, OfferID),
    CONSTRAINT CK_OrderOffers_Discount CHECK (DiscountAmountSnapshot >= 0)
);

CREATE TABLE Notifications (
    NotificationID BIGINT PRIMARY KEY IDENTITY(1,1),
    RecipientType NVARCHAR(30) NOT NULL,
    AdminUserID INT REFERENCES AdminUsers(UserID),
    DeliveryPartnerID INT REFERENCES DeliveryPartners(DeliveryPartnerID),
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
        (RecipientType = 'Admin' AND AdminUserID IS NOT NULL AND DeliveryPartnerID IS NULL)
        OR (RecipientType = 'Delivery Partner' AND AdminUserID IS NULL AND DeliveryPartnerID IS NOT NULL)
        OR (RecipientType = 'Customer' AND AdminUserID IS NULL AND DeliveryPartnerID IS NULL AND CustomerPhone IS NOT NULL)
    )
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
    CONSTRAINT CK_SupportTickets_EmailStatus CHECK (EmailStatus IN ('Pending', 'Sent', 'Failed'))
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
    Message NVARCHAR(4000) NOT NULL,
    IsInternalNote BIT NOT NULL DEFAULT 0,
    EmailStatus NVARCHAR(20),
    SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketMessages_Sender CHECK (SenderType IN ('Customer', 'Guided Support', 'Support Agent', 'System')),
    CONSTRAINT CK_SupportTicketMessages_EmailStatus CHECK (EmailStatus IS NULL OR EmailStatus IN ('Pending', 'Sent', 'Failed')),
    CONSTRAINT CK_SupportTicketMessages_Agent CHECK (SenderType <> 'Support Agent' OR SupportUserID IS NOT NULL)
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
    Action NVARCHAR(100) NOT NULL,
    PreviousStatus NVARCHAR(30),
    NewStatus NVARCHAR(30),
    Details NVARCHAR(MAX),
    CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT CK_SupportTicketHistory_Details CHECK (Details IS NULL OR ISJSON(Details) = 1)
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
CREATE INDEX IX_Orders_CustomerPhone ON Orders(CustomerPhone);
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
CREATE INDEX IX_DeliveryEarnings_PartnerStatus ON DeliveryEarnings(DeliveryPartnerID, EarningStatus, EarnedAt);
CREATE INDEX IX_Refunds_Status ON Refunds(RefundStatus);
CREATE INDEX IX_RefundTransactionHistory_Refund ON RefundTransactionHistory(RefundID, CreatedAt);
CREATE INDEX IX_Returns_Status ON Returns(Status);
CREATE INDEX IX_SupportTickets_Dashboard ON SupportTickets(TicketStatus, Priority, UpdatedAt DESC);
CREATE INDEX IX_SupportTickets_Order ON SupportTickets(OrderID, CreatedAt DESC);
CREATE INDEX IX_SupportTickets_Assignee ON SupportTickets(AssignedSupportUserID, TicketStatus, UpdatedAt DESC);
CREATE INDEX IX_CustomerSupportUsers_Assignment ON CustomerSupportUsers(Status, IsAvailableForAssignment, AccessExpiresAt, LastAssignedAt);
CREATE INDEX IX_CustomerSupportSessions_Active ON CustomerSupportSessions(SupportUserID, ExpiresAt) WHERE RevokedAt IS NULL;
CREATE INDEX IX_SupportTicketMessages_Ticket ON SupportTicketMessages(SupportTicketID, SentAt);
CREATE INDEX IX_SupportTicketHistory_Ticket ON SupportTicketHistory(SupportTicketID, CreatedAt);
CREATE INDEX IX_OrderStatusHistory_Order ON OrderStatusHistory(OrderID, ChangedAt DESC);
CREATE INDEX IX_OutboxMessages_Dispatch ON OutboxMessages(ProcessingStatus, AvailableAt, OutboxMessageID);

INSERT INTO ProductCategories (CategoryCode, CategoryName, CategoryType, IsActive, IsAvailable, DisplayOrder)
VALUES ('CAKES', 'Cakes', 'Cake', 1, 1, 1);

DECLARE @CakesCategoryID INT = (SELECT CategoryID FROM ProductCategories WHERE CategoryCode = 'CAKES');

INSERT INTO ProductCategories (ParentCategoryID, CategoryCode, CategoryName, CategoryType, IsActive, IsAvailable, DisplayOrder) VALUES
    (@CakesCategoryID, 'GUNUCO_PREMIUM', 'GUNUCO PREMIUM', 'Cake', 1, 1, 1),
    (@CakesCategoryID, 'CAKES_WEDDING', 'Cakes & Wedding Cakes', 'Cake', 1, 1, 2),
    (@CakesCategoryID, 'COOKIES', 'Cookies', 'General Food', 1, 1, 3);
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
INSERT INTO PaymentMethods (MethodName) VALUES ('Card'), ('UPI'), ('Net Banking'), ('Wallet'), ('Store Credit');