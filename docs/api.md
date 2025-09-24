
## Group Management

### Create Group
`POST /api/v1/admin/groups`

**Request:**
```json
{
  "name": "Beginner English A1",
  "course_id": 1,
  "teacher_id": 123
}
```

**Validations:**
- Teacher must exist, be active, and belong to same learning center
- Course must exist, be active, and belong to same learning center
- Excludes soft-deleted records

**Response:**
```json
{
  "id": 1,
  "name": "Beginner English A1",
  "course_id": 1,
  "teacher_id": 123,
  "student_count": 0,
  "created_at": "2024-01-15T11:00:00Z"
}
```

### List Groups
`GET /api/v1/admin/groups?skip=0&limit=50`

**Query Parameters:**
- `skip` (optional): Pagination offset
- `limit` (optional): Items per page

**Response:**
```json
[
  {
    "id": 1,
    "name": "Beginner English A1",
    "course_id": 1,
    "teacher_id": 123,
    "student_count": 15,
    "created_at": "2024-01-15T11:00:00Z"
  }
]
```

### Get Group
`GET /api/v1/admin/groups/1`

**Response:**
```json
{
  "id": 1,
  "name": "Beginner English A1",
  "course_id": 1,
  "teacher_id": 123,
  "student_count": 15,
  "created_at": "2024-01-15T11:00:00Z"
}
```

### Update Group
`PUT /api/v1/admin/groups/1`

**Request:**
```json
{
  "name": "Updated Group Name",
  "teacher_id": 124,
  "course_id": 2
}
```

**Validations:**
- New teacher must exist, be active, and belong to same learning center
- New course must exist, be active, and belong to same learning center
- Excludes soft-deleted records

**Response:**
```json
{
  "id": 1,
  "name": "Updated Group Name",
  "course_id": 2,
  "teacher_id": 124,
  "student_count": 15,
  "created_at": "2024-01-15T11:00:00Z"
}
```

### Add Student to Group
`POST /api/v1/admin/groups/1/students`

**Request:**
```json
{
  "student_id": 125
}
```

**Validations:**
- Student must belong to same learning center
- Group must belong to same learning center
- Student cannot be added to group twice

**Response:**
```json
{
  "message": "Student added to group successfully"
}
```

### Remove Student from Group
`DELETE /api/v1/admin/groups/1/students/125`

**Response:**
```json
{
  "message": "Student removed from group successfully"
}
```

### Delete Group (Soft Delete)
`DELETE /api/v1/admin/groups/1`

**Features:**
- Soft delete: Sets `deleted_at` timestamp
- Group relationships preserved
- Cannot be retrieved in future queries

**Response:**
```json
{
  "message": "Group deleted successfully"
}
```
