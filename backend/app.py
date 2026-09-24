from flask import Flask, jsonify, request
from flask_cors import CORS

from database import initialize_database, get_db_connection


app = Flask(__name__)
CORS(app)

# Initialize database
initialize_database()


# ============================================================
# HEALTH CHECK
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "success": True,
        "message": "EduLead API is running",
        "data": {
            "application": "EduLead",
            "version": "1.0.0",
            "status": "running"
        }
    }), 200


# ============================================================
# CREATE LEAD
# ============================================================

@app.route("/api/leads", methods=["POST"])
def create_lead():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
            "error": {
                "code": "INVALID_REQUEST"
            }
        }), 400

    # Required fields
    required_fields = [
        "student_name",
        "phone",
        "source"
    ]

    missing_fields = [
        field for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "Required fields are missing",
            "error": {
                "code": "MISSING_FIELDS",
                "fields": missing_fields
            }
        }), 400

    student_name = data["student_name"].strip()
    phone = data["phone"].strip()
    email = data.get("email")
    source = data["source"].strip()
    course_id = data.get("course_id")
    priority = data.get("priority", "Medium")

    # Validate priority
    allowed_priorities = [
        "Low",
        "Medium",
        "High"
    ]

    if priority not in allowed_priorities:
        return jsonify({
            "success": False,
            "message": "Invalid priority",
            "error": {
                "code": "INVALID_PRIORITY",
                "allowed_values": allowed_priorities
            }
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check duplicate phone number
    existing_lead = cursor.execute(
        """
        SELECT id, lead_code, student_name
        FROM leads
        WHERE phone = ?
        """,
        (phone,)
    ).fetchone()

    if existing_lead:
        connection.close()

        return jsonify({
            "success": False,
            "message": "A lead with this phone number already exists",
            "error": {
                "code": "DUPLICATE_LEAD",
                "existing_lead": {
                    "id": existing_lead["id"],
                    "lead_code": existing_lead["lead_code"],
                    "student_name": existing_lead["student_name"]
                }
            }
        }), 409

    # Generate next lead code
    last_lead = cursor.execute(
        """
        SELECT id
        FROM leads
        ORDER BY id DESC
        LIMIT 1
        """
    ).fetchone()

    if last_lead:
        next_id = last_lead["id"] + 1
    else:
        next_id = 1

    lead_code = f"LD-{1000 + next_id}"

    # Insert lead
    cursor.execute(
        """
        INSERT INTO leads (
            lead_code,
            student_name,
            phone,
            email,
            source,
            course_id,
            status,
            priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            lead_code,
            student_name,
            phone,
            email,
            source,
            course_id,
            "New",
            priority
        )
    )

    connection.commit()

    lead_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "message": "Lead created successfully",
        "data": {
            "id": lead_id,
            "lead_code": lead_code,
            "student_name": student_name,
            "phone": phone,
            "status": "New",
            "priority": priority
        }
    }), 201


# ============================================================
# GET ALL LEADS
# ============================================================

@app.route("/api/leads", methods=["GET"])
def get_leads():

    connection = get_db_connection()

    leads = connection.execute(
        """
        SELECT
            l.id,
            l.lead_code,
            l.student_name,
            l.phone,
            l.email,
            l.source,
            l.course_id,
            l.status,
            l.priority,
            l.counsellor_id,
            l.created_at,
            l.updated_at
        FROM leads l
        ORDER BY l.id DESC
        """
    ).fetchall()

    connection.close()

    lead_list = []

    for lead in leads:

        lead_list.append({
            "id": lead["id"],
            "lead_code": lead["lead_code"],
            "student_name": lead["student_name"],
            "phone": lead["phone"],
            "email": lead["email"],
            "source": lead["source"],
            "course_id": lead["course_id"],
            "status": lead["status"],
            "priority": lead["priority"],
            "counsellor_id": lead["counsellor_id"],
            "created_at": lead["created_at"],
            "updated_at": lead["updated_at"]
        })

    return jsonify({
        "success": True,
        "message": "Leads retrieved successfully",
        "data": {
            "count": len(lead_list),
            "leads": lead_list
        }
    }), 200


# ============================================================
# GET SINGLE LEAD
# ============================================================

@app.route("/api/leads/<int:lead_id>", methods=["GET"])
def get_lead(lead_id):

    connection = get_db_connection()

    lead = connection.execute(
        """
        SELECT
            id,
            lead_code,
            student_name,
            phone,
            email,
            source,
            course_id,
            status,
            priority,
            counsellor_id,
            created_at,
            updated_at
        FROM leads
        WHERE id = ?
        """,
        (lead_id,)
    ).fetchone()

    connection.close()

    if not lead:

        return jsonify({
            "success": False,
            "message": "Lead not found",
            "error": {
                "code": "LEAD_NOT_FOUND",
                "lead_id": lead_id
            }
        }), 404

    return jsonify({
        "success": True,
        "message": "Lead retrieved successfully",
        "data": {
            "id": lead["id"],
            "lead_code": lead["lead_code"],
            "student_name": lead["student_name"],
            "phone": lead["phone"],
            "email": lead["email"],
            "source": lead["source"],
            "course_id": lead["course_id"],
            "status": lead["status"],
            "priority": lead["priority"],
            "counsellor_id": lead["counsellor_id"],
            "created_at": lead["created_at"],
            "updated_at": lead["updated_at"]
        }
    }), 200


# ============================================================
# UPDATE LEAD
# ============================================================

@app.route("/api/leads/<int:lead_id>", methods=["PUT"])
def update_lead(lead_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required",
            "error": {
                "code": "INVALID_REQUEST"
            }
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check whether lead exists
    existing_lead = cursor.execute(
        """
        SELECT *
        FROM leads
        WHERE id = ?
        """,
        (lead_id,)
    ).fetchone()

    if not existing_lead:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Lead not found",
            "error": {
                "code": "LEAD_NOT_FOUND",
                "lead_id": lead_id
            }
        }), 404

    # Allowed statuses
    allowed_statuses = [
        "New",
        "Contacted",
        "Interested",
        "Follow-up Required",
        "Application Started",
        "Application Submitted",
        "Converted",
        "Lost",
        "Reopened"
    ]

    # Allowed priorities
    allowed_priorities = [
        "Low",
        "Medium",
        "High"
    ]

    # Get existing values when fields are not provided
    student_name = data.get(
        "student_name",
        existing_lead["student_name"]
    )

    email = data.get(
        "email",
        existing_lead["email"]
    )

    source = data.get(
        "source",
        existing_lead["source"]
    )

    course_id = data.get(
        "course_id",
        existing_lead["course_id"]
    )

    status = data.get(
        "status",
        existing_lead["status"]
    )

    priority = data.get(
        "priority",
        existing_lead["priority"]
    )

    counsellor_id = data.get(
        "counsellor_id",
        existing_lead["counsellor_id"]
    )

    # Validate status
    if status not in allowed_statuses:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Invalid status",
            "error": {
                "code": "INVALID_STATUS",
                "allowed_values": allowed_statuses
            }
        }), 400

    # Validate priority
    if priority not in allowed_priorities:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Invalid priority",
            "error": {
                "code": "INVALID_PRIORITY",
                "allowed_values": allowed_priorities
            }
        }), 400

    # Update lead
    cursor.execute(
        """
        UPDATE leads
        SET
            student_name = ?,
            email = ?,
            source = ?,
            course_id = ?,
            status = ?,
            priority = ?,
            counsellor_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
        """,
        (
            student_name,
            email,
            source,
            course_id,
            status,
            priority,
            counsellor_id,
            lead_id
        )
    )

    connection.commit()

    # Get updated lead
    updated_lead = cursor.execute(
        """
        SELECT
            id,
            lead_code,
            student_name,
            phone,
            email,
            source,
            course_id,
            status,
            priority,
            counsellor_id,
            created_at,
            updated_at
        FROM leads
        WHERE id = ?
        """,
        (lead_id,)
    ).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Lead updated successfully",
        "data": {
            "id": updated_lead["id"],
            "lead_code": updated_lead["lead_code"],
            "student_name": updated_lead["student_name"],
            "phone": updated_lead["phone"],
            "email": updated_lead["email"],
            "source": updated_lead["source"],
            "course_id": updated_lead["course_id"],
            "status": updated_lead["status"],
            "priority": updated_lead["priority"],
            "counsellor_id": updated_lead["counsellor_id"],
            "created_at": updated_lead["created_at"],
            "updated_at": updated_lead["updated_at"]
        }
    }), 200


# ============================================================
# CREATE FOLLOW-UP
# ============================================================

@app.route(
    "/api/leads/<int:lead_id>/followups",
    methods=["POST"]
)
def create_followup(lead_id):

    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "Request body is required",
            "error": {
                "code": "INVALID_REQUEST"
            }
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check whether lead exists
    lead = cursor.execute(
        """
        SELECT
            id,
            lead_code,
            status
        FROM leads
        WHERE id = ?
        """,
        (lead_id,)
    ).fetchone()

    if not lead:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Lead not found",
            "error": {
                "code": "LEAD_NOT_FOUND",
                "lead_id": lead_id
            }
        }), 404

    # Required fields
    required_fields = [
        "method",
        "followup_date"
    ]

    missing_fields = [
        field
        for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Required fields are missing",
            "error": {
                "code": "MISSING_FIELDS",
                "fields": missing_fields
            }
        }), 400

    method = data["method"]
    outcome = data.get("outcome")
    notes = data.get("notes")
    followup_date = data["followup_date"]
    next_followup_date = data.get("next_followup_date")

    # Allowed follow-up methods
    allowed_methods = [
        "Call",
        "WhatsApp",
        "Email",
        "Meeting",
        "Campus Visit"
    ]

    if method not in allowed_methods:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Invalid follow-up method",
            "error": {
                "code": "INVALID_METHOD",
                "allowed_values": allowed_methods
            }
        }), 400

    # Insert follow-up
    cursor.execute(
        """
        INSERT INTO followups (
            lead_id,
            method,
            outcome,
            notes,
            followup_date,
            next_followup_date
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            lead_id,
            method,
            outcome,
            notes,
            followup_date,
            next_followup_date
        )
    )

    connection.commit()

    followup_id = cursor.lastrowid

    connection.close()

    return jsonify({
        "success": True,
        "message": "Follow-up created successfully",
        "data": {
            "id": followup_id,
            "lead_id": lead_id,
            "lead_code": lead["lead_code"],
            "method": method,
            "outcome": outcome,
            "notes": notes,
            "followup_date": followup_date,
            "next_followup_date": next_followup_date
        }
    }), 201


# ============================================================
# GET FOLLOW-UPS FOR A LEAD
# ============================================================

@app.route(
    "/api/leads/<int:lead_id>/followups",
    methods=["GET"]
)
def get_followups(lead_id):

    connection = get_db_connection()

    # Check whether lead exists
    lead = connection.execute(
        """
        SELECT
            id,
            lead_code
        FROM leads
        WHERE id = ?
        """,
        (lead_id,)
    ).fetchone()

    if not lead:

        connection.close()

        return jsonify({
            "success": False,
            "message": "Lead not found",
            "error": {
                "code": "LEAD_NOT_FOUND",
                "lead_id": lead_id
            }
        }), 404

    # Get follow-ups
    followups = connection.execute(
        """
        SELECT
            id,
            lead_id,
            method,
            outcome,
            notes,
            followup_date,
            next_followup_date,
            created_at
        FROM followups
        WHERE lead_id = ?
        ORDER BY followup_date DESC, id DESC
        """,
        (lead_id,)
    ).fetchall()

    connection.close()

    followup_list = []

    for followup in followups:

        followup_list.append({
            "id": followup["id"],
            "lead_id": followup["lead_id"],
            "method": followup["method"],
            "outcome": followup["outcome"],
            "notes": followup["notes"],
            "followup_date": followup["followup_date"],
            "next_followup_date": followup["next_followup_date"],
            "created_at": followup["created_at"]
        })

    return jsonify({
        "success": True,
        "message": "Follow-ups retrieved successfully",
        "data": {
            "lead_id": lead["id"],
            "lead_code": lead["lead_code"],
            "count": len(followup_list),
            "followups": followup_list
        }
    }), 200


# ============================================================
# RUN APPLICATION
# ============================================================

# ============================================================
# CREATE COUNSELLOR
# ============================================================

@app.route("/api/counsellors", methods=["POST"])
def create_counsellor():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required",
            "error": {
                "code": "INVALID_REQUEST"
            }
        }), 400

    # Required fields
    required_fields = [
        "name",
        "email"
    ]

    missing_fields = [
        field
        for field in required_fields
        if not data.get(field)
    ]

    if missing_fields:
        return jsonify({
            "success": False,
            "message": "Required fields are missing",
            "error": {
                "code": "MISSING_FIELDS",
                "fields": missing_fields
            }
        }), 400

    name = data["name"].strip()
    email = data["email"].strip().lower()

    # Basic validation
    if not name:
        return jsonify({
            "success": False,
            "message": "Counsellor name is required",
            "error": {
                "code": "INVALID_NAME"
            }
        }), 400

    if "@" not in email:
        return jsonify({
            "success": False,
            "message": "Please enter a valid email address",
            "error": {
                "code": "INVALID_EMAIL"
            }
        }), 400

    connection = get_db_connection()
    cursor = connection.cursor()

    # Check duplicate email
    existing_user = cursor.execute(
        """
        SELECT id, name, email, role
        FROM users
        WHERE email = ?
        """,
        (email,)
    ).fetchone()

    if existing_user:

        connection.close()

        return jsonify({
            "success": False,
            "message": "A user with this email already exists",
            "error": {
                "code": "DUPLICATE_EMAIL",
                "existing_user": {
                    "id": existing_user["id"],
                    "name": existing_user["name"],
                    "email": existing_user["email"],
                    "role": existing_user["role"]
                }
            }
        }), 409

    # Create counsellor
    cursor.execute(
        """
        INSERT INTO users (
            name,
            email,
            role,
            active
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            name,
            email,
            "Counsellor",
            1
        )
    )

    connection.commit()

    counsellor_id = cursor.lastrowid

    counsellor = cursor.execute(
        """
        SELECT
            id,
            name,
            email,
            role,
            active,
            created_at
        FROM users
        WHERE id = ?
        """,
        (counsellor_id,)
    ).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "message": "Counsellor created successfully",
        "data": {
            "id": counsellor["id"],
            "name": counsellor["name"],
            "email": counsellor["email"],
            "role": counsellor["role"],
            "active": bool(counsellor["active"]),
            "created_at": counsellor["created_at"]
        }
    }), 201

# ============================================================
# GET COUNSELLORS
# ============================================================

@app.route("/api/counsellors", methods=["GET"])
def get_counsellors():

    connection = get_db_connection()

    counsellors = connection.execute("""
        SELECT
            id,
            name,
            email,
            role,
            active,
            created_at
        FROM users
        WHERE role = 'Counsellor'
        ORDER BY name
    """).fetchall()

    connection.close()

    counsellor_list = []

    for counsellor in counsellors:

        counsellor_list.append({
            "id": counsellor["id"],
            "name": counsellor["name"],
            "email": counsellor["email"],
            "role": counsellor["role"],
            "active": bool(counsellor["active"]),
            "created_at": counsellor["created_at"]
        })

    return jsonify({
        "success": True,
        "message": "Counsellors retrieved successfully",
        "data": {
            "count": len(counsellor_list),
            "counsellors": counsellor_list
        }
    }), 200

# ============================================================
# DASHBOARD
# ============================================================

@app.route("/api/dashboard", methods=["GET"])
def get_dashboard():

    connection = get_db_connection()

    # --------------------------------------------------------
    # Total leads
    # --------------------------------------------------------

    total_leads = connection.execute("""
        SELECT COUNT(*) AS count
        FROM leads
    """).fetchone()["count"]

    # --------------------------------------------------------
    # Leads by status
    # --------------------------------------------------------

    status_rows = connection.execute("""
        SELECT
            status,
            COUNT(*) AS count
        FROM leads
        GROUP BY status
        ORDER BY count DESC
    """).fetchall()

    status_distribution = []

    for row in status_rows:
        status_distribution.append({
            "status": row["status"],
            "count": row["count"]
        })

    # --------------------------------------------------------
    # Leads by source
    # --------------------------------------------------------

    source_rows = connection.execute("""
        SELECT
            source,
            COUNT(*) AS count
        FROM leads
        GROUP BY source
        ORDER BY count DESC
    """).fetchall()

    source_distribution = []

    for row in source_rows:
        source_distribution.append({
            "source": row["source"],
            "count": row["count"]
        })

    # --------------------------------------------------------
    # Leads by priority
    # --------------------------------------------------------

    priority_rows = connection.execute("""
        SELECT
            priority,
            COUNT(*) AS count
        FROM leads
        GROUP BY priority
        ORDER BY count DESC
    """).fetchall()

    priority_distribution = []

    for row in priority_rows:
        priority_distribution.append({
            "priority": row["priority"],
            "count": row["count"]
        })

    # --------------------------------------------------------
    # Converted leads
    # --------------------------------------------------------

    converted_leads = connection.execute("""
        SELECT COUNT(*) AS count
        FROM leads
        WHERE status = 'Converted'
    """).fetchone()["count"]

    # --------------------------------------------------------
    # Conversion rate
    # --------------------------------------------------------

    if total_leads > 0:
        conversion_rate = round(
            (converted_leads / total_leads) * 100,
            2
        )
    else:
        conversion_rate = 0

    # --------------------------------------------------------
    # Total follow-ups
    # --------------------------------------------------------

    total_followups = connection.execute("""
        SELECT COUNT(*) AS count
        FROM followups
    """).fetchone()["count"]

    # --------------------------------------------------------
    # Overdue follow-ups
    # --------------------------------------------------------

    overdue_followups = connection.execute("""
        SELECT COUNT(*) AS count
        FROM followups
        WHERE
            next_followup_date IS NOT NULL
            AND next_followup_date < DATE('now')
    """).fetchone()["count"]

    # --------------------------------------------------------
    # Today's follow-ups
    # --------------------------------------------------------

    todays_followups = connection.execute("""
        SELECT COUNT(*) AS count
        FROM followups
        WHERE
            next_followup_date = DATE('now')
    """).fetchone()["count"]

    # --------------------------------------------------------
    # Close connection
    # --------------------------------------------------------

    connection.close()

    # --------------------------------------------------------
    # Response
    # --------------------------------------------------------

    return jsonify({
        "success": True,
        "message": "Dashboard data retrieved successfully",
        "data": {
            "summary": {
                "total_leads": total_leads,
                "converted_leads": converted_leads,
                "conversion_rate": conversion_rate,
                "total_followups": total_followups,
                "overdue_followups": overdue_followups,
                "todays_followups": todays_followups
            },
            "status_distribution": status_distribution,
            "source_distribution": source_distribution,
            "priority_distribution": priority_distribution
        }
    }), 200

if __name__ == "__main__":
    app.run(debug=True)