# Features

## 🔐 Authentication & User Management

### Multi-Role System
Relief Connect supports four distinct user roles, each with specific permissions and capabilities:

- **USER**: Regular users who can create help requests and make donations
- **VOLUNTEER_CLUB**: Volunteer organizations managing relief camps
- **ADMIN**: Administrators with system management capabilities
- **SYSTEM_ADMINISTRATOR**: Full system access and control

### JWT Authentication
- Secure token-based authentication
- Refresh token mechanism for extended sessions
- Token expiration and renewal
- Secure password hashing with bcrypt

### Role-Based Access Control (RBAC)
- Granular permissions based on user roles
- Route-level authorization
- Resource-level access control
- Dynamic permission checking

### User Profiles
- Complete user profile management
- Status tracking (ACTIVE, INACTIVE, DISABLED)
- Contact information management
- User activity tracking

---

## 🆘 Help Request Management

### Location-Based Requests
- **GPS Integration**: Automatic location detection
- **Manual Pin Placement**: Users can manually select location on map
- **Coordinate Storage**: Precise latitude/longitude tracking
- **Map Visualization**: All requests visible on interactive map

### Urgency Levels
Requests can be categorized by urgency:
- **LOW**: Non-urgent requests
- **MEDIUM**: Moderate urgency
- **HIGH**: High priority
- **CRITICAL**: Emergency situations requiring immediate attention

### Request Categories
- **Food/Water**: Food and water requirements
- **Rescue**: Rescue and evacuation needs
- **Medical**: Medical assistance and supplies
- **Shelter**: Temporary shelter requirements
- **Other**: Miscellaneous needs

### Detailed Information Tracking
- **People Count**: Total number of people affected
- **Demographics**: Separate tracking for elders, children, and pets
- **Ration Items**: Specific items needed (JSON-based flexible structure)
- **Contact Information**: Multiple contact options (Phone, WhatsApp, Email, None)

### Status Management
- **OPEN**: Active request awaiting assistance
- **CLOSED**: Request fulfilled or no longer needed
- **Status Updates**: Real-time status changes
- **History Tracking**: Complete audit trail

---

## 🏕️ Relief Camp Management

### Camp Registration
- Volunteer clubs can create and register relief camps
- Camp information includes location, capacity, and needs
- Multiple camps per organization
- Camp profile management

### Camp Types
- **OFFICIAL**: Government or official organization camps
- **COMMUNITY**: Community-driven or informal camps

### People Tracking
- **People Range**: Categorize by size (1-10, 10-50, 50+)
- **Actual Count**: Track exact number of people
- **Demographics**: Track special needs populations

### Needs Management
Camps can specify multiple needs:
- **Food**: Food supplies and meals
- **Medical**: Medical supplies and healthcare
- **Rescue**: Rescue operations and equipment
- **Clothes**: Clothing and personal items
- **Children/Elderly**: Special care requirements

### Drop-off Locations
- Designate specific locations for donations
- Multiple drop-off points per camp
- Location coordinates and descriptions
- Contact information for each location

### Camp Status
- **ACTIVE**: Camp is operational
- **INACTIVE**: Camp is closed or not operational
- **Status Updates**: Real-time status management

---

## 💝 Donation System

### Request-Based Donations
- Donors can donate to specific help requests
- Direct connection between donor and requester
- Request-specific item tracking

### Ration Item Tracking
- **Flexible Structure**: JSON-based item storage
- **Item Quantities**: Track exact quantities of each item
- **Custom Items**: Support for any type of donation item
- **Inventory Management**: Track what's needed vs. what's donated

### Status Workflow
Multi-stage donation tracking:
1. **Created**: Donation request created
2. **Scheduled**: Donor marks delivery as scheduled (`donatorMarkedScheduled`)
3. **Completed by Donor**: Donor marks as delivered (`donatorMarkedCompleted`)
4. **Confirmed by Owner**: Request owner confirms receipt (`ownerMarkedCompleted`)

### Donor Information
- Donor name and contact information
- Donation history tracking
- Donor-user relationship management
- Privacy controls

---

## 👥 Volunteer Club System

### Club Registration
- Organizations can register as volunteer clubs
- Admin approval process
- Club profile creation and management
- Contact information and details

### Club Dashboard
Comprehensive dashboard featuring:
- **Statistics**: Total requests, donations, camps
- **Request Management**: View and manage help requests
- **Donation Tracking**: Monitor donations to requests
- **Camp Overview**: Manage all camps from one place
- **Membership Management**: Approve/reject membership requests

### Camp Management
- Create multiple relief camps
- Edit camp information
- Manage camp status
- Track camp needs and donations
- View camp analytics

### Membership System
- Users can request to join volunteer clubs
- **PENDING**: Awaiting approval
- **APPROVED**: Membership granted
- **REJECTED**: Membership denied
- Club owners can manage memberships

### Club Profiles
- Detailed club information
- Contact details (phone, email, address)
- Club description and mission
- Status management (ACTIVE, INACTIVE)

---

## 🗺️ Interactive Mapping

### Leaflet Integration
- Powered by Leaflet and OpenStreetMap
- Interactive map with zoom and pan
- Custom markers and icons
- Responsive map design

### Color-Coded Markers
Visual indicators for different request types:
- **Red**: Critical urgency
- **Orange**: High urgency
- **Yellow**: Medium urgency
- **Green**: Low urgency
- **Blue**: Relief camps

### Camp Markers
- Distinct markers for relief camps
- Camp information in popups
- Direct links to camp details
- Camp status indicators

### Filtering Capabilities
- **By Category**: Filter by request category
- **By Urgency**: Filter by urgency level
- **By District**: Geographic filtering
- **By Type**: Individual requests vs. camps
- **Combined Filters**: Multiple filters simultaneously

### Location Picker
- Interactive map-based location selection
- GPS auto-detection
- Manual pin placement
- Coordinate display and editing

---

## 👨‍💼 Admin Dashboard

### User Management
- View all registered users
- Create new users
- Update user information
- Manage user roles and permissions
- Activate/deactivate users
- User search and filtering

### Volunteer Club Management
- View all volunteer clubs
- Approve/reject club registrations
- Edit club information
- Manage club status
- Club analytics and statistics

### Membership Management
- View all membership requests
- Approve/reject memberships
- Manage club members
- Membership statistics

### System Analytics
- Total users, requests, donations, camps
- Activity metrics and trends
- Geographic distribution
- System health monitoring

### Content Moderation
- Review help requests
- Moderate camp registrations
- Manage inappropriate content
- Flag and review system

---

## 🌐 Multi-Language Support

### Internationalization (i18n)
- Full internationalization support via next-i18next
- Dynamic language switching
- Language persistence

### Supported Languages
- **English**: Primary language
- **Sinhala (සිංහල)**: Native language support
- **Tamil (தமிழ்)**: Native language support

### Language Features
- UI elements translated
- Form labels and messages
- Error messages
- Success notifications

---

## 📱 Responsive Design

### Mobile-First Approach
- Designed for mobile devices first
- Touch-friendly interface
- Optimized for small screens
- Fast loading on mobile networks

### Progressive Enhancement
- Works on all devices
- Enhanced experience on desktop
- Tablet optimization
- Cross-browser compatibility

### User Experience
- Large, touch-friendly buttons
- Adequate spacing for mobile
- Intuitive navigation
- Fast page loads

---

## 🔔 Additional Features

### Real-Time Updates
- Live status updates
- Real-time map markers
- Instant notification system (when implemented)

### Search Functionality
- Search help requests
- Search camps
- Search volunteer clubs
- Advanced filtering options

### Analytics & Reporting
- Request statistics
- Donation tracking
- Camp analytics
- User activity reports

### Safety Features
- Input validation
- XSS protection
- CSRF protection
- Rate limiting
- Safety warnings and banners

---

[← Back to README](../README.md) | [Previous: Overview](01-overview.md) | [Next: Technology Stack →](03-technology-stack.md)

