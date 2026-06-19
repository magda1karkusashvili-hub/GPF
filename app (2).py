from flask import Flask, render_template, request, redirect, url_for, flash, session, Response, send_file
import sqlite3
import csv
import io
from datetime import timedelta, datetime
from openpyxl import Workbook
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

# ================= SECURITY =================
app.secret_key = "my-super-secret-key-2026"

app.config.update(
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",
    SESSION_COOKIE_SECURE=False,
    PERMANENT_SESSION_LIFETIME=timedelta(minutes=30)
)

DB = "bookings.db"

# ================= INIT DATABASE =================
def init_db():
    with sqlite3.connect(DB) as conn:
        c = conn.cursor()

        c.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT,
            date TEXT,
            name TEXT,
            email TEXT,
            phone TEXT,
            status TEXT DEFAULT 'NEW'
        )
        """)

        c.execute("""
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
        """)

        c.execute("SELECT COUNT(*) FROM admin")
        if c.fetchone()[0] == 0:
            c.execute(
                "INSERT INTO admin (username, password) VALUES (?, ?)",
                ("admin", generate_password_hash("1234"))
            )

        conn.commit()

init_db()

# ================= AUTH =================
@app.route("/login", methods=["GET", "POST"])
def login():

    if request.method == "POST":
        username = request.form.get("username")
        password = request.form.get("password")

        with sqlite3.connect(DB) as conn:
            c = conn.cursor()
            c.execute("SELECT password FROM admin WHERE username=?", (username,))
            user = c.fetchone()

        if user and check_password_hash(user[0], password):
            session["admin"] = True
            return redirect(url_for("dashboard"))

        flash("Invalid login!", "error")

    return render_template("login.html")


@app.route("/logout")
def logout():
    session.pop("admin", None)
    return redirect(url_for("login"))

# ================= PROTECT DASHBOARD =================
def admin_required(func):
    def wrapper(*args, **kwargs):
        if not session.get("admin"):
            return redirect(url_for("login"))
        return func(*args, **kwargs)
    wrapper.__name__ = func.__name__
    return wrapper

# ================= PUBLIC PAGES =================
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/gallery")
def gallery():
    return render_template("gallery.html")


@app.route("/contact")
def contact():
    return render_template("contact.html")


@app.route("/document")
def document():
    return render_template("document.html")


@app.route("/news")
def news():
    return render_template("news.html")


# ================= BOOK PAGE =================
@app.route("/book-your-flight")
@app.route("/BookYourFlight")
def book_page():
    today = datetime.today().strftime('%Y-%m-%d')
    return render_template("BookYourFlight.html", today=today)


# ================= BOOKING =================
@app.route("/book", methods=["POST"])
def book():

    location = request.form.get("location")
    date = request.form.get("date")
    name = request.form.get("name")
    email = request.form.get("email")
    phone = request.form.get("phone")

    if not all([location, date, name, email, phone]):
        flash("Please fill all fields!", "error")
        return redirect(url_for("book_page"))

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("""
            INSERT INTO bookings (location, date, name, email, phone, status)
            VALUES (?, ?, ?, ?, ?, 'NEW')
        """, (location, date, name, email, phone))
        conn.commit()

    flash("Booking submitted successfully!", "success")
    return redirect(url_for("book_page"))

# ================= DASHBOARD =================
@app.route("/dashboard")
@admin_required
def dashboard():

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()

        c.execute("SELECT * FROM bookings ORDER BY id DESC")
        bookings = c.fetchall()

        c.execute("SELECT COUNT(*) FROM bookings")
        total = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM bookings WHERE status='NEW'")
        new_count = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM bookings WHERE status='CONFIRMED'")
        confirmed = c.fetchone()[0]

        c.execute("SELECT COUNT(*) FROM bookings WHERE status='CANCELLED'")
        cancelled = c.fetchone()[0]

    return render_template(
        "dashboard.html",
        bookings=bookings,
        total=total,
        new_count=new_count,
        confirmed=confirmed,
        cancelled=cancelled
    )

# ================= STATUS UPDATE =================
@app.route("/update-status/<int:id>/<status>")
@admin_required
def update_status(id, status):

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("UPDATE bookings SET status=? WHERE id=?", (status, id))
        conn.commit()

    return redirect(url_for("dashboard"))

# ================= DELETE =================
@app.route("/delete-booking/<int:id>")
@admin_required
def delete_booking(id):

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("DELETE FROM bookings WHERE id=?", (id,))
        conn.commit()

    return redirect(url_for("dashboard"))

# ================= EXPORT CSV =================
@app.route("/export-csv")
@admin_required
def export_csv():

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM bookings")
        data = c.fetchall()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["ID","Location","Date","Name","Email","Phone","Status"])
    writer.writerows(data)

    return Response(
        output.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition":"attachment;filename=bookings.csv"}
    )

# ================= EXPORT EXCEL =================
@app.route("/export-excel")
@admin_required
def export_excel():

    with sqlite3.connect(DB) as conn:
        c = conn.cursor()
        c.execute("SELECT * FROM bookings")
        data = c.fetchall()

    wb = Workbook()
    ws = wb.active
    ws.title = "Bookings"

    ws.append(["ID","Location","Date","Name","Email","Phone","Status"])

    for row in data:
        ws.append(row)

    file = io.BytesIO()
    wb.save(file)
    file.seek(0)

    return send_file(
        file,
        download_name="bookings.xlsx",
        as_attachment=True
    )

# ================= RUN =================
import os

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
