# Design Document

## Overview

VyapaarAI is a serverless, AI-driven content automation platform built on AWS that transforms raw product photos into professional marketing creatives with multilingual captions. The system leverages AWS managed services to provide a scalable, cost-effective solution specifically designed for Indian small businesses and shopkeepers.

The platform follows an event-driven architecture where user actions trigger serverless functions that orchestrate AI services for image analysis, background generation, and caption creation. The entire workflow is optimized for mobile-first usage with minimal user interaction required.

### Key Design Principles

- **Serverless-First**: All compute resources scale automatically with zero idle costs
- **AI-Driven Automation**: Minimize manual user input through intelligent defaults
- **Mobile-Optimized**: Responsive design for small screens and touch interactions
- **Culturally Aware**: Content generation considers Indian context and multilingual needs
- **Cost-Conscious**: Optimize resource usage to keep per-generation costs low

## Architecture

### High-Level System Architecture

The system consists of three primary layers:

1. **Presentation Layer**: AWS Amplify-hosted web application providing mobile-responsive UI
2. **Application Layer**: AWS Lambda functions orchestrating business logic and AI workflows
3. **Data Layer**: Amazon S3 for object storage and DynamoDB for metadata persistence

### Component Interaction Flow

```
User → Amplify Frontend → API Gateway → Lambda Functions → {
  Amazon Cognito (Authentication)
  Amazon S3 (Image Storage)
  Amazon Rekognition (Product Detection)
  Amazon Bedrock (AI Generation)
  Amazon DynamoDB (Metadata Storage)
}
```


## User Journey Design

### Complete User Workflow

1. **Authentication**
   - User opens the web application on mobile browser
   - Enters mobile number (Indian format: +91-XXXXXXXXXX)
   - Receives SMS verification code via Amazon Cognito
   - Enters code to establish authenticated session
   - Session token stored for subsequent requests

2. **Product Image Upload**
   - User taps "Create New Content" button
   - Selects image from gallery or captures new photo
   - Frontend validates file format (JPEG/PNG/WebP) and size (<10MB)
   - Image uploaded to S3 with unique key: `users/{userId}/uploads/{timestamp}-{uuid}.jpg`
   - Upload triggers Lambda function via S3 event notification

3. **AI Analysis and Generation**
   - Lambda function retrieves uploaded image from S3
   - Calls Amazon Rekognition to detect products and extract attributes
   - Identifies primary product and category (e.g., "food", "clothing", "electronics")
   - Constructs generation prompt based on product category and cultural context
   - Calls Amazon Bedrock Titan Image Generator to create 3 background variations
   - Calls Amazon Bedrock Claude to generate multilingual caption
   - Stores generated creatives in S3: `users/{userId}/creatives/{contentId}/`
   - Writes metadata to DynamoDB including generation parameters and timestamps

4. **Review and Approval**
   - Frontend polls or receives notification when generation completes
   - Displays 3 creative variations with caption in user's selected language
   - User swipes through variations and selects preferred version
   - User can regenerate with different language or request new variations
   - User taps "Approve" to finalize content package

5. **Export and Share**
   - System generates platform-optimized versions (WhatsApp: 1080x1080, Instagram: 1080x1350, Facebook: 1200x630)
   - User selects target platform(s)
   - Downloads image(s) with caption copied to clipboard
   - Native share sheet opens for direct sharing to social apps
   - Content package saved to campaign history

### User Experience Optimizations

- **Progress Indicators**: Real-time feedback during upload and generation (estimated 30s)
- **Offline Capability**: Queue uploads when connectivity is poor, process when online
- **Smart Defaults**: Auto-select most common language and platform based on user history
- **Quick Actions**: One-tap regenerate, one-tap share to WhatsApp (most common use case)


## Components and Interfaces

### Frontend Application (AWS Amplify)

**Technology Stack**: React with TypeScript, hosted on AWS Amplify

**Key Components**:
- `AuthenticationFlow`: Handles mobile number input and OTP verification
- `ImageUploader`: Manages file selection, validation, and S3 upload with progress tracking
- `ContentGenerator`: Displays generation progress and results
- `CreativeViewer`: Carousel for reviewing generated variations
- `ExportManager`: Handles platform selection and download/share actions
- `CampaignHistory`: Lists past content packages with search and filter

**API Interface**:
```typescript
interface VyapaarAIAPI {
  // Authentication
  sendVerificationCode(mobileNumber: string): Promise<void>
  verifyCode(mobileNumber: string, code: string): Promise<AuthToken>
  
  // Content Generation
  uploadImage(file: File): Promise<UploadResult>
  generateContent(imageId: string, language: Language): Promise<GenerationJob>
  getGenerationStatus(jobId: string): Promise<JobStatus>
  
  // Content Management
  approveContent(contentId: string, variationIndex: number): Promise<void>
  regenerateContent(contentId: string, params: RegenerationParams): Promise<GenerationJob>
  exportContent(contentId: string, platforms: Platform[]): Promise<ExportUrls>
  
  // Campaign History
  listCampaigns(userId: string, pagination: PaginationParams): Promise<Campaign[]>
  getCampaign(campaignId: string): Promise<CampaignDetails>
  deleteCampaign(campaignId: string): Promise<void>
}
```

### Backend Services (AWS Lambda)

**Function: ImageUploadHandler**
- **Trigger**: S3 PUT event on `users/{userId}/uploads/` prefix
- **Purpose**: Initiate content generation workflow
- **Logic**:
  1. Validate image was uploaded successfully
  2. Create generation job record in DynamoDB
  3. Invoke ProductAnalysisFunction asynchronously
- **IAM Permissions**: S3 read, DynamoDB write, Lambda invoke

**Function: ProductAnalysisFunction**
- **Trigger**: Invoked by ImageUploadHandler
- **Purpose**: Detect and classify product in uploaded image
- **Logic**:
  1. Retrieve image from S3
  2. Call Rekognition DetectLabels API
  3. Identify primary product and extract attributes (category, color, dominant features)
  4. Store analysis results in DynamoDB
  5. Invoke BackgroundGenerationFunction
- **IAM Permissions**: S3 read, Rekognition detect, DynamoDB write, Lambda invoke

**Function: BackgroundGenerationFunction**
- **Trigger**: Invoked by ProductAnalysisFunction
- **Purpose**: Generate lifestyle scene backgrounds using AI
- **Logic**:
  1. Retrieve product analysis from DynamoDB
  2. Construct culturally-appropriate prompt based on product category
  3. Call Bedrock Titan Image Generator API 3 times with variation seeds
  4. Store generated images in S3
  5. Invoke CaptionGenerationFunction
- **IAM Permissions**: DynamoDB read/write, Bedrock invoke, S3 write, Lambda invoke

**Function: CaptionGenerationFunction**
- **Trigger**: Invoked by BackgroundGenerationFunction
- **Purpose**: Generate multilingual marketing captions
- **Logic**:
  1. Retrieve product analysis and user language preference
  2. Construct prompt for Claude with product details and language
  3. Call Bedrock Claude API for caption generation
  4. Validate caption length (50-150 characters)
  5. Store caption in DynamoDB and mark job as complete
- **IAM Permissions**: DynamoDB read/write, Bedrock invoke

**Function: ContentExportFunction**
- **Trigger**: API Gateway POST /export
- **Purpose**: Generate platform-optimized image versions
- **Logic**:
  1. Retrieve approved creative from S3
  2. Resize/crop for each target platform using Sharp library
  3. Store optimized versions in S3 with presigned URLs
  4. Return download URLs to frontend
- **IAM Permissions**: S3 read/write

**Function: CampaignManagementFunction**
- **Trigger**: API Gateway requests for campaign CRUD operations
- **Purpose**: Manage campaign history and metadata
- **Logic**: Standard CRUD operations on DynamoDB campaigns table
- **IAM Permissions**: DynamoDB read/write/delete, S3 delete (for cleanup)


### Authentication Service (Amazon Cognito)

**Configuration**:
- User Pool with phone number as username
- SMS-based MFA for verification
- JWT tokens for API authentication
- 24-hour session timeout

**User Attributes**:
- `phone_number` (required, unique)
- `preferred_language` (custom attribute)
- `business_type` (custom attribute, optional)

**Authentication Flow**:
1. User provides phone number → Cognito sends SMS code
2. User enters code → Cognito validates and issues JWT tokens (ID token, Access token, Refresh token)
3. Frontend stores tokens in secure storage
4. API Gateway validates JWT on each request

### Storage Service (Amazon S3)

**Bucket Structure**:
```
kirana-creative-content/
├── users/
│   └── {userId}/
│       ├── uploads/
│       │   └── {timestamp}-{uuid}.jpg (original images)
│       └── creatives/
│           └── {contentId}/
│               ├── original.jpg
│               ├── variation-1.jpg
│               ├── variation-2.jpg
│               ├── variation-3.jpg
│               └── exports/
│                   ├── whatsapp.jpg
│                   ├── instagram.jpg
│                   └── facebook.jpg
```

**Lifecycle Policies**:
- Uploads folder: Delete after 7 days (temporary staging)
- Creatives folder: Transition to S3 Glacier after 90 days
- Exports folder: Delete after 30 days (user should have downloaded)

**Security**:
- Server-side encryption (SSE-S3) enabled
- Bucket policy restricts access to authenticated users only
- Presigned URLs for temporary download access (15-minute expiry)

### Database Service (Amazon DynamoDB)

**Table: GenerationJobs**
- **Partition Key**: `jobId` (UUID)
- **Sort Key**: `userId` (for user-specific queries)
- **Attributes**:
  - `status`: "pending" | "analyzing" | "generating" | "complete" | "failed"
  - `uploadedImageKey`: S3 key of original image
  - `productAnalysis`: JSON object with Rekognition results
  - `generatedVariations`: Array of S3 keys
  - `caption`: Generated text
  - `language`: Selected language code
  - `createdAt`: ISO timestamp
  - `completedAt`: ISO timestamp
- **GSI**: `userId-createdAt-index` for campaign history queries

**Table: Campaigns**
- **Partition Key**: `campaignId` (UUID)
- **Sort Key**: `userId`
- **Attributes**:
  - `contentId`: Reference to approved content
  - `productCategory`: Detected category
  - `selectedVariation`: Index of approved variation
  - `exportedPlatforms`: Array of platform names
  - `createdAt`: ISO timestamp
- **GSI**: `userId-createdAt-index` for chronological listing

**Table: UserPreferences**
- **Partition Key**: `userId`
- **Attributes**:
  - `defaultLanguage`: Language code
  - `preferredPlatforms`: Array of platform names
  - `totalGenerations`: Counter
  - `lastActiveAt`: ISO timestamp


## Data Models

### Core Domain Models

```typescript
// User Authentication
interface User {
  userId: string;
  phoneNumber: string;
  preferredLanguage: Language;
  businessType?: string;
  createdAt: Date;
}

// Image Upload
interface UploadResult {
  imageId: string;
  s3Key: string;
  uploadedAt: Date;
  fileSize: number;
  dimensions: { width: number; height: number };
}

// Product Analysis
interface ProductAnalysis {
  primaryProduct: {
    category: ProductCategory;
    confidence: number;
    attributes: {
      color?: string;
      shape?: string;
      material?: string;
    };
  };
  detectedLabels: Array<{
    name: string;
    confidence: number;
  }>;
  boundingBox?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

// Content Generation
interface GenerationJob {
  jobId: string;
  userId: string;
  status: JobStatus;
  uploadedImageKey: string;
  productAnalysis?: ProductAnalysis;
  generatedVariations?: string[]; // S3 keys
  caption?: string;
  language: Language;
  createdAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

type JobStatus = 
  | "pending" 
  | "analyzing" 
  | "generating_backgrounds" 
  | "generating_caption" 
  | "complete" 
  | "failed";

// Marketing Creative
interface MarketingCreative {
  contentId: string;
  variations: Array<{
    imageUrl: string;
    s3Key: string;
  }>;
  caption: string;
  language: Language;
  productCategory: ProductCategory;
  generatedAt: Date;
}

// Campaign
interface Campaign {
  campaignId: string;
  userId: string;
  contentId: string;
  productCategory: ProductCategory;
  selectedVariation: number;
  exportedPlatforms: Platform[];
  createdAt: Date;
}

// Export Configuration
interface ExportRequest {
  contentId: string;
  variationIndex: number;
  platforms: Platform[];
}

interface ExportUrls {
  [platform: string]: {
    url: string;
    dimensions: { width: number; height: number };
    expiresAt: Date;
  };
}

// Enums
type Language = 
  | "hi" // Hindi
  | "en" // English
  | "ta" // Tamil
  | "te" // Telugu
  | "bn" // Bengali
  | "mr" // Marathi
  | "gu" // Gujarati
  | "kn"; // Kannada

type ProductCategory = 
  | "food"
  | "clothing"
  | "electronics"
  | "jewelry"
  | "cosmetics"
  | "home_goods"
  | "stationery"
  | "other";

type Platform = 
  | "whatsapp"
  | "instagram"
  | "facebook";

// Platform Specifications
const PLATFORM_DIMENSIONS: Record<Platform, { width: number; height: number }> = {
  whatsapp: { width: 1080, height: 1080 },
  instagram: { width: 1080, height: 1350 },
  facebook: { width: 1200, height: 630 }
};
```

### AI Generation Prompts

**Background Generation Prompt Template**:
```
Create a professional lifestyle scene for a {productCategory} product.
The scene should:
- Feature an Indian cultural context
- Use warm, inviting lighting
- Include contextually appropriate props and setting
- Maintain focus on the product
- Be suitable for small business marketing

Product details: {productAttributes}
Style: {stylePreference}
```

**Caption Generation Prompt Template**:
```
Generate a marketing caption in {language} for this product.

Product: {productCategory}
Attributes: {productAttributes}

Requirements:
- Length: 50-150 characters
- Include product benefit
- Include call-to-action
- Use conversational tone appropriate for Indian small business
- Avoid complex English words if generating in regional language

Output only the caption text, no additional formatting.
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Authentication Session Creation

*For any* valid mobile number and correct verification code, authenticating should create a valid session with JWT tokens that can be used for subsequent API requests.

**Validates: Requirements 1.1, 1.2**

### Property 2: Authentication Rejection

*For any* incorrect verification code, the authentication attempt should be rejected and no session should be created.

**Validates: Requirements 1.3**

### Property 3: Session Expiry Enforcement

*For any* expired session token, attempting to access protected resources should require re-authentication.

**Validates: Requirements 1.5**

### Property 4: Image Upload Validation

*For any* file with supported format (JPEG, PNG, WebP) and size under 10MB, the upload should succeed and generate a unique identifier.

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 5: Product Detection Completeness

*For any* uploaded product image, the analysis service should detect objects, identify a primary product with confidence score, and extract product attributes.

**Validates: Requirements 3.1, 3.2, 3.5**

### Property 6: Multiple Product Selection

*For any* image containing multiple detected products, the system should select the most prominent product (highest confidence or largest bounding box) as primary.

**Validates: Requirements 3.3**

### Property 7: Background Variation Count

*For any* product detection result, the system should generate exactly 3 background variations.

**Validates: Requirements 4.4**

### Property 8: Background Generation Retry

*For any* failed background generation attempt, the system should either retry with adjusted parameters or notify the user of failure.

**Validates: Requirements 4.5**

### Property 9: Caption Language Matching

*For any* selected language and generated content, the output caption should be in the requested language.

**Validates: Requirements 6.1**

### Property 10: Caption Content Completeness

*For any* generated caption, it should include product benefits and call-to-action text, and be between 50-150 characters in length.

**Validates: Requirements 6.3, 6.4**

### Property 11: Content Approval State Change

*For any* content package, when a user approves it, the status should change to "ready for distribution" and be persisted.

**Validates: Requirements 7.3**

### Property 12: Export Format Availability

*For any* approved content package, the system should provide download options in both JPEG and PNG formats.

**Validates: Requirements 8.1**

### Property 13: Platform Dimension Correctness

*For any* exported content for a specific platform (WhatsApp, Facebook, Instagram), the generated image dimensions should match that platform's specifications exactly.

**Validates: Requirements 8.2**

### Property 14: Export Caption Inclusion

*For any* downloaded content package, the caption should be included as copyable text.

**Validates: Requirements 8.3**

### Property 15: Campaign Storage Round-Trip

*For any* created content package, storing it as a campaign and then retrieving it should return the same content with all metadata (creation date, product type, language) preserved.

**Validates: Requirements 9.1, 9.3**

### Property 16: Campaign Chronological Ordering

*For any* user's campaign list, campaigns should be ordered chronologically by creation date (newest first).

**Validates: Requirements 9.2**

### Property 17: Campaign Deletion Completeness

*For any* campaign, when deleted, all associated data should be removed from both storage service and database service.

**Validates: Requirements 9.5**

### Property 18: Generation Queue Ordering

*For any* sequence of multiple generation requests, they should be processed in the order they were received (FIFO).

**Validates: Requirements 11.5**

### Property 19: Authorization Enforcement

*For any* resource access attempt, the system should verify authentication and authorization, blocking unauthorized access.

**Validates: Requirements 12.3**

### Property 20: Content Isolation

*For any* two different users, neither user should be able to access the other user's content packages or campaigns.

**Validates: Requirements 12.4**

### Property 21: Image Optimization

*For any* image processed for AI generation, the system should optimize (resize/compress) the image before sending to generation services.

**Validates: Requirements 13.2**

### Property 22: Request Throttling

*For any* user making excessive API calls beyond the rate limit, the system should throttle requests and return appropriate rate limit errors.

**Validates: Requirements 13.3**

### Property 23: Mobile Image Sizing

*For any* image served to mobile devices, the system should provide appropriately sized versions based on device viewport.

**Validates: Requirements 14.4**

### Property 24: Prompt Safety Filtering

*For any* content generation request, inappropriate or unsafe prompts should be filtered before being sent to AI generation services.

**Validates: Requirements 15.1**

### Property 25: Unsafe Content Regeneration

*For any* detected unsafe content in generation results, the system should automatically regenerate with adjusted safety parameters.

**Validates: Requirements 15.3**

### Property 26: Generation Request Logging

*For any* AI generation request, the system should create a log entry with request parameters and results.

**Validates: Requirements 15.5**

### Property 27: Retry with Exponential Backoff

*For any* failed service component call, the system should retry with exponentially increasing delays between attempts.

**Validates: Requirements 16.2**

### Property 28: User Feedback Logging

*For any* user feedback on generation quality, the system should log the feedback with associated content metadata for analysis.

**Validates: Requirements 17.4**


## Error Handling

### Error Categories and Strategies

**1. User Input Errors**
- **Invalid file format**: Return 400 with message "Please upload JPEG, PNG, or WebP image"
- **File too large**: Return 400 with message "Image must be under 10MB"
- **Invalid phone number**: Return 400 with message "Please enter valid Indian mobile number"
- **Strategy**: Validate early at frontend and backend, provide clear actionable messages

**2. Authentication Errors**
- **Invalid verification code**: Return 401 with message "Incorrect code, please try again"
- **Expired session**: Return 401 with message "Session expired, please login again"
- **Rate limit exceeded**: Return 429 with message "Too many attempts, please wait"
- **Strategy**: Use Cognito error codes, implement exponential backoff for retries

**3. AI Service Errors**
- **Rekognition failure**: Retry up to 3 times with exponential backoff, fallback to manual category selection
- **Bedrock timeout**: Retry once, if fails notify user "Generation taking longer than expected, please try again"
- **Content safety violation**: Automatically regenerate with stricter safety parameters, log incident
- **Strategy**: Implement circuit breaker pattern, graceful degradation, user notification

**4. Storage Errors**
- **S3 upload failure**: Retry up to 3 times, if fails return 500 with "Upload failed, please try again"
- **S3 retrieval failure**: Retry once, if fails return 404 with "Content not found"
- **DynamoDB write failure**: Retry with exponential backoff, if fails return 500
- **Strategy**: Use AWS SDK built-in retry logic, implement idempotency keys

**5. System Errors**
- **Lambda timeout**: Set timeout to 60s for generation functions, return 504 if exceeded
- **Memory exhaustion**: Allocate 2GB RAM for image processing functions
- **Concurrent execution limit**: Implement queue with SQS for overflow requests
- **Strategy**: Monitor CloudWatch metrics, set up alarms, auto-scaling

### Error Response Format

```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
    retryable: boolean;
  };
  requestId: string;
  timestamp: string;
}
```

### Error Codes

- `AUTH_INVALID_CODE`: Verification code incorrect
- `AUTH_EXPIRED_SESSION`: Session token expired
- `UPLOAD_INVALID_FORMAT`: Unsupported file format
- `UPLOAD_TOO_LARGE`: File exceeds size limit
- `GENERATION_FAILED`: AI generation failed
- `GENERATION_TIMEOUT`: Generation exceeded time limit
- `CONTENT_NOT_FOUND`: Requested content doesn't exist
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Unexpected system error

### Logging and Monitoring

**CloudWatch Logs**:
- All Lambda function invocations with request/response
- Error logs with stack traces
- AI generation parameters and results
- User feedback and quality metrics

**CloudWatch Metrics**:
- Generation success rate
- Average generation time
- API error rates by endpoint
- Cost per generation
- Active user count

**Alarms**:
- Error rate > 5% for 5 minutes
- Average generation time > 45 seconds
- Daily cost > $100
- Lambda concurrent executions > 80% of limit


## Workflow Orchestration

### Event-Driven Architecture

The system uses an event-driven architecture where each stage of content generation triggers the next stage automatically:

```
S3 Upload Event → ImageUploadHandler
    ↓
ProductAnalysisFunction
    ↓
BackgroundGenerationFunction
    ↓
CaptionGenerationFunction
    ↓
Job Status: Complete
```

### Orchestration Options

**Option 1: Direct Lambda Invocation (MVP)**
- Each Lambda function directly invokes the next function
- Simple to implement and debug
- Suitable for linear workflows
- Error handling requires custom retry logic in each function

**Option 2: AWS Step Functions (Future Enhancement)**
- Define workflow as state machine
- Built-in error handling and retry logic
- Visual workflow monitoring
- Better for complex workflows with branching
- Additional cost per state transition

**MVP Implementation**: Use Option 1 (direct invocation) for simplicity and cost efficiency. Each function handles its own retries and error propagation.

### Asynchronous Processing

**Frontend Polling Strategy**:
1. User uploads image, receives `jobId`
2. Frontend polls `GET /jobs/{jobId}` every 3 seconds
3. Backend returns current status: "analyzing", "generating_backgrounds", "generating_caption", "complete"
4. When status is "complete", fetch generated content
5. Maximum polling duration: 60 seconds, then show timeout error

**Alternative: WebSocket Notifications (Future)**:
- Establish WebSocket connection via API Gateway
- Backend pushes status updates in real-time
- Reduces unnecessary polling requests
- Better user experience with instant updates

### Idempotency

All API operations implement idempotency to handle retries safely:

**Upload**: Use client-generated UUID as idempotency key
**Generation**: Check if job already exists for same image+language combination
**Export**: Cache export results for 15 minutes, return cached URLs for duplicate requests
**Delete**: Deleting already-deleted resource returns success (idempotent)

### Concurrency Control

**Per-User Rate Limiting**:
- Maximum 5 concurrent generation jobs per user
- Maximum 20 API requests per minute per user
- Implemented using DynamoDB atomic counters

**System-Wide Limits**:
- Lambda concurrent executions: 100 (adjustable)
- Bedrock API rate limits: Monitor and implement backoff
- S3 request rate: 3,500 PUT/s per prefix (sufficient for MVP)


## Security Design

### Authentication and Authorization

**Authentication Flow**:
1. User provides phone number → Cognito User Pool
2. Cognito sends SMS verification code
3. User enters code → Cognito validates and issues JWT tokens
4. Frontend stores tokens in browser secure storage (httpOnly cookies or localStorage with encryption)
5. All API requests include JWT in Authorization header
6. API Gateway validates JWT before forwarding to Lambda

**Authorization Model**:
- **User Role**: Can only access their own resources
- **Resource Ownership**: All resources tagged with `userId`
- **Access Control**: Lambda functions verify `userId` from JWT matches resource owner

**Token Management**:
- ID Token: Contains user identity claims, expires in 1 hour
- Access Token: Used for API authorization, expires in 1 hour
- Refresh Token: Used to obtain new tokens, expires in 24 hours
- Frontend automatically refreshes tokens before expiry

### Secure Storage

**S3 Security**:
- Server-side encryption (SSE-S3) enabled by default
- Bucket policy denies public access
- Object ACLs set to private
- Presigned URLs for temporary access (15-minute expiry)
- CORS configured for frontend domain only

**DynamoDB Security**:
- Encryption at rest enabled
- Fine-grained access control via IAM policies
- Each Lambda function has minimum required permissions
- No direct database access from frontend

### IAM Role-Based Access

**Lambda Execution Roles**:

```yaml
ImageUploadHandlerRole:
  Permissions:
    - s3:GetObject (uploads prefix)
    - dynamodb:PutItem (GenerationJobs table)
    - lambda:InvokeFunction (ProductAnalysisFunction)

ProductAnalysisFunctionRole:
  Permissions:
    - s3:GetObject (uploads prefix)
    - rekognition:DetectLabels
    - dynamodb:UpdateItem (GenerationJobs table)
    - lambda:InvokeFunction (BackgroundGenerationFunction)

BackgroundGenerationFunctionRole:
  Permissions:
    - dynamodb:GetItem, UpdateItem (GenerationJobs table)
    - bedrock:InvokeModel (Titan Image Generator)
    - s3:PutObject (creatives prefix)
    - lambda:InvokeFunction (CaptionGenerationFunction)

CaptionGenerationFunctionRole:
  Permissions:
    - dynamodb:GetItem, UpdateItem (GenerationJobs table)
    - bedrock:InvokeModel (Claude)
    - s3:PutObject (creatives prefix)

ContentExportFunctionRole:
  Permissions:
    - s3:GetObject, PutObject (creatives prefix)
    - dynamodb:GetItem (GenerationJobs table)

CampaignManagementFunctionRole:
  Permissions:
    - dynamodb:Query, GetItem, PutItem, DeleteItem (Campaigns table)
    - s3:DeleteObject (creatives prefix, for cleanup)
```

**Principle of Least Privilege**: Each function has only the permissions it needs, scoped to specific resources.

### Secrets Handling

**API Keys and Credentials**:
- AWS service credentials managed via IAM roles (no hardcoded keys)
- Third-party API keys (if any) stored in AWS Secrets Manager
- Lambda functions retrieve secrets at runtime
- Secrets rotated automatically every 90 days

**Environment Variables**:
- Non-sensitive configuration in Lambda environment variables
- Sensitive values referenced from Secrets Manager ARNs
- No secrets in source code or version control

### Data Privacy

**User Data Protection**:
- All user content isolated by `userId` prefix in S3
- DynamoDB queries filtered by `userId` partition key
- No cross-user data access possible
- User data deleted on account deletion request

**PII Handling**:
- Phone numbers hashed in logs
- No PII in CloudWatch Logs
- User consent required for data collection
- GDPR-compliant data retention policies

### Network Security

**API Gateway**:
- HTTPS only (TLS 1.2+)
- API keys for additional protection (optional)
- Request throttling to prevent abuse
- WAF rules for common attack patterns (SQL injection, XSS)

**VPC Configuration** (Future Enhancement):
- Lambda functions in VPC for additional isolation
- Private subnets for compute
- VPC endpoints for AWS service access
- NAT Gateway for outbound internet access


## Scalability and Cost Design

### Serverless Scaling Behavior

**Automatic Scaling**:
- **Lambda**: Scales from 0 to 1000 concurrent executions automatically
- **API Gateway**: Handles 10,000 requests per second by default
- **DynamoDB**: On-demand capacity mode scales automatically
- **S3**: Unlimited storage, scales to handle any request volume
- **Cognito**: Scales to millions of users

**Scaling Triggers**:
- Increased user uploads → More Lambda invocations
- High concurrent users → API Gateway scales
- Large campaign history → DynamoDB auto-scales read/write capacity
- No manual intervention required

### Pay-Per-Use Cost Model

**Cost Breakdown (Estimated per content generation)**:

| Service | Usage | Cost per Generation |
|---------|-------|---------------------|
| Lambda | 4 functions × 30s avg × 2GB RAM | ₹0.50 |
| Bedrock Titan | 3 image generations | ₹3.00 |
| Bedrock Claude | 1 caption generation | ₹0.20 |
| Rekognition | 1 image analysis | ₹0.10 |
| S3 | Storage + requests | ₹0.05 |
| DynamoDB | Read/write operations | ₹0.05 |
| API Gateway | API calls | ₹0.10 |
| **Total** | | **₹4.00** |

**Monthly Cost Projections**:
- 1,000 users × 10 generations/month = 10,000 generations
- Total monthly cost: ₹40,000 (~$480)
- Cost per user per month: ₹40 (~$0.48)

**AWS Free Tier Benefits** (First 12 months):
- Lambda: 1M requests/month free
- DynamoDB: 25GB storage + 25 read/write capacity units free
- S3: 5GB storage + 20,000 GET requests free
- Cognito: 50,000 MAUs free
- Estimated free tier savings: ₹10,000/month

### Cost Control Strategies

**1. Image Optimization**:
- Resize uploaded images to max 2048px before processing
- Compress images to reduce S3 storage costs
- Use WebP format where supported (smaller file size)
- Estimated savings: 30% on storage and transfer costs

**2. Caching**:
- Cache Rekognition results for identical images (hash-based)
- Cache generated backgrounds for common product categories
- Cache platform-optimized exports for 15 minutes
- Estimated savings: 20% on AI generation costs for repeat patterns

**3. Request Throttling**:
- Limit users to 5 concurrent generations
- Limit API requests to 20/minute per user
- Prevents cost overruns from abuse or bugs
- Protects against unexpected cost spikes

**4. Storage Lifecycle**:
- Delete temporary uploads after 7 days
- Archive old creatives to Glacier after 90 days (90% cost reduction)
- Delete exports after 30 days (user should have downloaded)
- Estimated savings: 50% on long-term storage costs

**5. Monitoring and Alerts**:
- CloudWatch alarm when daily cost exceeds ₹2,000
- Budget alerts at 80% and 100% of monthly budget
- Automatic throttling if cost threshold exceeded
- Weekly cost reports to admin

### Performance Optimization

**Lambda Optimization**:
- Use Lambda layers for shared dependencies (Sharp, AWS SDK)
- Provision concurrency for critical functions (avoid cold starts)
- Optimize memory allocation (2GB for image processing, 512MB for others)
- Use ARM64 architecture (20% cost savings)

**Database Optimization**:
- Use DynamoDB single-table design to minimize queries
- Implement efficient GSI for common query patterns
- Use batch operations where possible
- Cache frequently accessed data in Lambda memory

**Image Processing Optimization**:
- Process images in parallel where possible
- Use streaming for large files
- Implement progressive image loading in frontend
- Lazy load campaign history images

### Capacity Planning

**MVP Targets** (First 3 months):
- 1,000 active users
- 10,000 content generations/month
- 99% uptime during business hours
- <30s average generation time

**Growth Projections** (6-12 months):
- 10,000 active users
- 100,000 content generations/month
- 99.5% uptime 24/7
- <20s average generation time

**Scaling Checkpoints**:
- At 5,000 users: Review Lambda concurrency limits
- At 50,000 generations/month: Implement caching layer
- At 100,000 generations/month: Consider reserved capacity for cost savings
- At 1M generations/month: Evaluate custom ML models for cost optimization


## UI/UX Design Principles

### Mobile-First Approach

**Design Philosophy**:
- Primary target: Mobile browsers (Chrome, Safari on Android/iOS)
- Screen sizes: 320px - 428px width
- Touch-optimized interactions
- Minimal text input required
- Visual-first interface

**Layout Strategy**:
- Single-column layout for all screens
- Large touch targets (minimum 44px × 44px)
- Bottom navigation for thumb-friendly access
- Sticky action buttons at bottom of screen
- Swipe gestures for image carousel

### Minimal User Interaction

**Simplified Workflow**:
1. **Login**: Phone number + OTP (2 inputs)
2. **Upload**: Single tap to select/capture image
3. **Generate**: Automatic (no user input required)
4. **Review**: Swipe through variations, tap to select
5. **Export**: Select platform(s), tap download

**Smart Defaults**:
- Language: Auto-detect from phone settings or previous selection
- Platform: Pre-select WhatsApp (most common in India)
- Variation: Show first variation by default
- Caption: Auto-generated, editable if needed

**Progressive Disclosure**:
- Show only essential options initially
- Advanced options (language change, regenerate) in overflow menu
- Help text appears contextually when needed
- Error messages are actionable and clear

### Visual Previews

**Image Display**:
- Full-width image previews
- Pinch-to-zoom for detail inspection
- Side-by-side comparison mode (optional)
- Platform preview mode (shows how it will look on WhatsApp/Instagram/Facebook)

**Caption Preview**:
- Displayed below image in platform-appropriate style
- Character count indicator
- Inline editing with real-time preview
- Copy-to-clipboard button

**Generation Progress**:
- Animated progress indicator with stages:
  - "Analyzing your product..." (0-30%)
  - "Creating backgrounds..." (30-70%)
  - "Writing caption..." (70-90%)
  - "Finalizing..." (90-100%)
- Estimated time remaining
- Cancel option (if needed)

### Local Language Accessibility

**Multilingual Interface**:
- UI available in all 8 supported languages
- Language selector in settings
- RTL support for future languages (Urdu)
- Font optimization for Indic scripts

**Language-Specific Considerations**:
- Hindi: Devanagari script, larger font size
- Tamil/Telugu: Complex script rendering
- English: Simplified vocabulary for non-native speakers
- Mixed language support (English + regional language)

**Accessibility Features**:
- High contrast mode for outdoor visibility
- Large text option for older users
- Voice input for caption editing (future)
- Screen reader support for visually impaired

### Visual Design System

**Color Palette**:
- Primary: Vibrant orange (#FF6B35) - energetic, Indian-friendly
- Secondary: Deep blue (#004E89) - trust, professionalism
- Success: Green (#06D6A0) - positive feedback
- Error: Red (#EF476F) - clear warnings
- Background: White (#FFFFFF) - clean, minimal
- Text: Dark gray (#2B2D42) - readable

**Typography**:
- Headings: Inter Bold, 20-24px
- Body: Inter Regular, 16px
- Captions: Inter Regular, 14px
- Buttons: Inter SemiBold, 16px
- Support for Indic fonts: Noto Sans Devanagari, Noto Sans Tamil, etc.

**Iconography**:
- Material Design icons for consistency
- Custom icons for product categories
- Culturally appropriate symbols
- Clear, recognizable at small sizes

**Spacing and Layout**:
- 16px base unit for consistent spacing
- 24px padding on mobile screens
- 8px gap between related elements
- 32px gap between sections

### Interaction Patterns

**Feedback Mechanisms**:
- Haptic feedback on button taps (mobile)
- Loading spinners for async operations
- Success animations (checkmark, confetti)
- Error shake animation for invalid inputs
- Toast notifications for background operations

**Gestures**:
- Swipe left/right: Navigate between variations
- Pull down: Refresh campaign history
- Long press: Show additional options
- Pinch: Zoom image preview
- Double tap: Quick approve

**Empty States**:
- First-time user: Onboarding tutorial with sample generation
- No campaigns: "Create your first marketing content" CTA
- Generation failed: "Something went wrong" with retry button
- No internet: "Offline mode" with queued uploads

### Performance Perception

**Perceived Performance**:
- Optimistic UI updates (show success before confirmation)
- Skeleton screens during loading
- Progressive image loading (blur-up technique)
- Instant feedback on interactions
- Background processing with notifications

**Data Efficiency**:
- Lazy load campaign history images
- Compress images for mobile networks
- Cache static assets aggressively
- Prefetch next likely action (e.g., export options after approval)


## Testing Strategy

### Dual Testing Approach

The system will be validated using both unit tests and property-based tests to ensure comprehensive coverage:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs using randomized testing

Both testing approaches are complementary and necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across a wide range of inputs.

### Property-Based Testing Framework

**Framework Selection**: 
- **JavaScript/TypeScript**: fast-check library
- **Python** (if used for Lambda): Hypothesis library

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Each property test must reference its design document property
- Tag format: `Feature: kirana-creative, Property {number}: {property_text}`

### Test Coverage by Component

**Frontend Application Tests**:

*Unit Tests*:
- Authentication flow with valid/invalid codes
- Image upload validation (format, size)
- UI state management during generation
- Campaign history pagination
- Error message display

*Property Tests*:
- Property 4: Image upload validation for all supported formats
- Property 23: Mobile image sizing for various viewport sizes

**Backend Lambda Function Tests**:

*Unit Tests*:
- ImageUploadHandler: S3 event parsing, job creation
- ProductAnalysisFunction: Rekognition response parsing
- BackgroundGenerationFunction: Prompt construction, variation generation
- CaptionGenerationFunction: Language selection, length validation
- ContentExportFunction: Platform dimension mapping
- CampaignManagementFunction: CRUD operations

*Property Tests*:
- Property 1: Authentication session creation for valid credentials
- Property 2: Authentication rejection for invalid codes
- Property 3: Session expiry enforcement
- Property 5: Product detection completeness
- Property 6: Multiple product selection logic
- Property 7: Background variation count
- Property 8: Background generation retry logic
- Property 9: Caption language matching
- Property 10: Caption content completeness
- Property 11: Content approval state changes
- Property 12: Export format availability
- Property 13: Platform dimension correctness
- Property 14: Export caption inclusion
- Property 15: Campaign storage round-trip
- Property 16: Campaign chronological ordering
- Property 17: Campaign deletion completeness
- Property 18: Generation queue ordering
- Property 19: Authorization enforcement
- Property 20: Content isolation between users
- Property 21: Image optimization
- Property 22: Request throttling
- Property 24: Prompt safety filtering
- Property 25: Unsafe content regeneration
- Property 26: Generation request logging
- Property 27: Retry with exponential backoff
- Property 28: User feedback logging

**Integration Tests**:
- End-to-end content generation workflow
- Authentication → Upload → Generate → Export flow
- Campaign creation and retrieval
- Error handling across service boundaries
- Concurrent user scenarios

### Test Data Generation

**Property Test Generators**:

```typescript
// Example generators for fast-check

// Valid mobile numbers
const mobileNumberGen = fc.string({ minLength: 10, maxLength: 10 })
  .map(s => '+91' + s.replace(/\D/g, ''));

// Image files
const imageFileGen = fc.record({
  name: fc.string(),
  type: fc.constantFrom('image/jpeg', 'image/png', 'image/webp'),
  size: fc.integer({ min: 1000, max: 10_000_000 }),
  data: fc.uint8Array({ minLength: 1000, maxLength: 10_000_000 })
});

// Product categories
const productCategoryGen = fc.constantFrom(
  'food', 'clothing', 'electronics', 'jewelry', 
  'cosmetics', 'home_goods', 'stationery', 'other'
);

// Languages
const languageGen = fc.constantFrom(
  'hi', 'en', 'ta', 'te', 'bn', 'mr', 'gu', 'kn'
);

// Platforms
const platformGen = fc.constantFrom('whatsapp', 'instagram', 'facebook');

// Generation jobs
const generationJobGen = fc.record({
  jobId: fc.uuid(),
  userId: fc.uuid(),
  status: fc.constantFrom('pending', 'analyzing', 'generating_backgrounds', 
                          'generating_caption', 'complete', 'failed'),
  language: languageGen,
  productCategory: productCategoryGen
});
```

### Test Execution Strategy

**Local Development**:
- Run unit tests on every file save (watch mode)
- Run property tests before commit
- Use test coverage tool (Jest coverage, nyc)
- Target: 80% code coverage

**CI/CD Pipeline**:
1. Lint and type check
2. Run unit tests (fast feedback)
3. Run property tests (comprehensive validation)
4. Run integration tests (slower, full workflow)
5. Deploy to staging if all tests pass
6. Run smoke tests on staging
7. Deploy to production if smoke tests pass

**Test Environments**:
- **Local**: Mock AWS services using LocalStack or AWS SDK mocks
- **Staging**: Real AWS services with test data
- **Production**: Synthetic monitoring with canary tests

### Mocking Strategy

**AWS Service Mocks**:
- Use AWS SDK mocks for unit tests (aws-sdk-mock library)
- Mock Cognito authentication responses
- Mock S3 upload/download operations
- Mock Rekognition detection results
- Mock Bedrock generation responses
- Mock DynamoDB read/write operations

**Avoid Over-Mocking**:
- Property tests should test real logic, not mocks
- Integration tests use real AWS services in staging
- Only mock external dependencies, not internal logic

### Performance Testing

**Load Testing** (Future):
- Simulate 100 concurrent users
- Measure average generation time
- Identify bottlenecks
- Test auto-scaling behavior
- Tools: Artillery, k6, or AWS Load Testing

**Stress Testing** (Future):
- Test system limits (1000+ concurrent users)
- Verify graceful degradation
- Test error handling under load
- Identify breaking points

### Security Testing

**Automated Security Scans**:
- Dependency vulnerability scanning (npm audit, Snyk)
- SAST (Static Application Security Testing) with SonarQube
- Infrastructure security with AWS Security Hub
- API security testing with OWASP ZAP

**Manual Security Review**:
- IAM policy review (least privilege)
- Authentication flow review
- Data encryption verification
- Input validation review

### Monitoring and Observability

**Test Metrics**:
- Test execution time
- Test pass/fail rate
- Code coverage percentage
- Property test iteration count
- Flaky test detection

**Production Monitoring**:
- Generation success rate (target: >95%)
- Average generation time (target: <30s)
- Error rate by endpoint (target: <5%)
- User satisfaction score (from feedback)
- Cost per generation (target: <₹5)


## Future Architecture Enhancements

### Video Ad Generation

**Capability**: Generate short video ads (15-30 seconds) from product images

**Architecture Changes**:
- Add video generation service using Amazon Bedrock or third-party API
- Extend storage to handle video files (larger S3 costs)
- Add video processing Lambda with higher memory (3GB+)
- Support video formats: MP4, WebM
- Platform-specific video specs (Instagram Reels, YouTube Shorts)

**Workflow**:
1. User selects "Create Video" option
2. System generates multiple still frames with product
3. Adds transitions, text overlays, background music
4. Renders final video with voiceover in selected language
5. Optimizes for target platform

**Estimated Additional Cost**: ₹15-25 per video generation

### Social Media API Integration

**Capability**: Direct posting to social media platforms without manual download

**Architecture Changes**:
- Integrate Facebook Graph API for Facebook/Instagram posting
- Integrate WhatsApp Business API for direct sharing
- Add OAuth flow for user authorization
- Store social media tokens in Secrets Manager
- Add posting scheduler for optimal timing

**Workflow**:
1. User approves content and selects "Post Now" or "Schedule"
2. System authenticates with social platform
3. Uploads image and caption via platform API
4. Returns post URL and analytics link
5. Tracks post performance (likes, shares, comments)

**Challenges**:
- API rate limits and quotas
- Platform policy compliance
- Token refresh and management
- Multi-account support

### ONDC Integration

**Capability**: Integration with Open Network for Digital Commerce for product catalog sync

**Architecture Changes**:
- Add ONDC API client for catalog management
- Sync product images and descriptions to ONDC network
- Auto-generate marketing content for new catalog items
- Support bulk operations for multiple products

**Workflow**:
1. User connects ONDC seller account
2. System fetches product catalog
3. Auto-generates marketing content for each product
4. User reviews and approves batch
5. Content published to ONDC network and social media

**Benefits**:
- Unified product management
- Automated content generation for entire catalog
- Increased discoverability on ONDC network
- Streamlined workflow for multi-product businesses

### AI-Driven Posting Recommendations

**Capability**: Intelligent recommendations for when and what to post

**Architecture Changes**:
- Add ML model for engagement prediction
- Collect historical post performance data
- Analyze audience behavior patterns
- Add recommendation engine Lambda

**Features**:
- **Optimal Timing**: Suggest best time to post based on audience activity
- **Content Mix**: Recommend product categories to feature
- **A/B Testing**: Generate variations and test performance
- **Trend Analysis**: Identify trending products and themes
- **Competitor Insights**: Analyze competitor content strategies

**Data Sources**:
- User's historical post performance
- Platform analytics APIs
- Industry benchmarks
- Seasonal trends

### Advanced Personalization

**Capability**: Personalized content generation based on business type and audience

**Architecture Changes**:
- Add user profiling system
- Collect business metadata (type, location, target audience)
- Train custom models for specific business categories
- Implement A/B testing framework

**Personalization Factors**:
- Business type (grocery, clothing, electronics, etc.)
- Geographic location (regional preferences)
- Target audience demographics
- Historical content performance
- Seasonal events and festivals

### Multi-Language Content Variants

**Capability**: Generate content in multiple languages simultaneously

**Architecture Changes**:
- Parallel caption generation for selected languages
- Language-specific background variations
- Cultural adaptation per language
- Bulk export for all language variants

**Use Case**: Businesses serving multilingual customer base can create content for all languages at once

### Analytics Dashboard

**Capability**: Comprehensive analytics for content performance

**Architecture Changes**:
- Add analytics data warehouse (Amazon Redshift or Athena)
- Collect engagement metrics from social platforms
- Build visualization dashboard (QuickSight or custom)
- Add reporting Lambda functions

**Metrics**:
- Content generation trends
- Most popular product categories
- Language preferences
- Platform performance comparison
- ROI calculation (engagement vs. cost)
- User retention and churn

### Collaborative Features

**Capability**: Team collaboration for businesses with multiple users

**Architecture Changes**:
- Add team management system
- Implement role-based access (owner, editor, viewer)
- Add approval workflows
- Shared campaign library

**Features**:
- Multiple users per business account
- Content approval workflow
- Shared brand guidelines
- Team activity logs

### White-Label Solution

**Capability**: Platform can be white-labeled for partners

**Architecture Changes**:
- Multi-tenant architecture
- Custom branding per tenant
- Separate data isolation
- Tenant-specific configuration

**Use Cases**:
- Digital marketing agencies
- E-commerce platforms
- Business service providers
- Government SMB support programs

### Cost Optimization Strategies

**Long-Term Optimizations**:
1. **Custom ML Models**: Train custom models for common use cases (reduce Bedrock costs)
2. **Edge Caching**: Use CloudFront for static assets and API responses
3. **Reserved Capacity**: Purchase reserved Lambda capacity for predictable workloads
4. **Spot Instances**: Use EC2 Spot for batch processing (if moving away from pure serverless)
5. **Data Compression**: Aggressive compression for storage and transfer
6. **Smart Caching**: Cache AI generation results for similar inputs

**Estimated Savings**: 40-60% cost reduction at scale (>100K generations/month)

