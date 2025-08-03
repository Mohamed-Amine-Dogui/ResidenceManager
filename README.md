# ResidenceManager

**ResidenceManager** is a web application designed to manage a residential complex composed of multiple apartments. It offers functionality for booking, check-in/check-out, maintenance tracking, and billing. The app supports both light and dark mode and is in French.

# Schema


## **1. Users**

* `id`: `str` (UUID or autoincrement INT)
* `email`: `str`
* `password_hash`: `str`
* `role`: `str` (e.g., `'user'`, `'admin'`)
* `created_at`: `datetime`
* `last_login`: `datetime`

---

## **2. Auth Providers**

* `id`: `str`
* `provider_name`: `str` (e.g., `'email'`, `'google'`)
* `description`: `str` (optional)

---

## **3. User Providers**

* `id`: `str`
* `user_id`: `str`
* `provider_id`: `str`
* `external_id`: `str`
* `linked_at`: `datetime`

---

## **4. Login Attempts**

* `id`: `str`
* `user_id`: `str` (nullable)
* `email`: `str`
* `success`: `bool`
* `provider`: `str`
* `ip_address`: `str` (optional)
* `timestamp`: `datetime`

---

## **5. Password Reset Requests**

* `id`: `str`
* `user_id`: `str`
* `reset_token`: `str`
* `requested_at`: `datetime`
* `used_at`: `datetime` (nullable)

---

## **6. Houses**

* `id`: `str` (e.g., `'maison-1'`)
* `name`: `str` (e.g., `'Mv1'`)

---

## **7. Reservations**

* `id`: `str`
* `house_id`: `str`
* `guest_name`: `str`
* `phone`: `str` (optional)
* `email`: `str` (optional)
* `checkin_date`: `date`
* `checkout_date`: `date`
* `advance_paid`: `float`
* `created_at`: `datetime`
* `updated_at`: `datetime`

---

## **8. Reservation Audit Log**

* `id`: `str`
* `reservation_id`: `str`
* `action`: `str` (`'created'`, `'updated'`, `'deleted'`)
* `timestamp`: `datetime`
* `user_id`: `str`

---

## **9. Checklist Categories**

* `id`: `int`
* `name`: `str`

---

## **10. Checklist Items**

* `id`: `str`
* `house_id`: `str`
* `step_number`: `int` (optional)
* `category_id`: `int`
* `description`: `str`
* `product_required`: `str`
* `type`: `str` (`'nettoyage'`, `'vérification'`, `'entretien'`)

---

## **11. House Checklist Status**

* `id`: `str`
* `house_id`: `str`
* `item_id`: `str`
* `is_completed`: `bool`
* `completed_at`: `datetime` (nullable)
* `updated_by`: `str` (nullable)

---

## **12. House Category Status**

* `id`: `str`
* `house_id`: `str`
* `category_id`: `int`
* `is_ready`: `bool`
* `ready_at`: `datetime` (optional)

---

## **13. House Daily Occupancy**

* `id`: `str`
* `house_id`: `str`
* `date`: `date`
* `is_occupied`: `bool`
* `source`: `str` (`'reservation'`, `'maintenance_block'`)
* `updated_at`: `datetime` (optional)

---

## **14. Task Completion Logs**

* `id`: `str`
* `house_id`: `str`
* `item_id`: `str`
* `user_id`: `str`
* `completed`: `bool`
* `timestamp`: `datetime`

---

## **15. Maintenance Issues**

* `id`: `str`
* `house_id`: `str`
* `issue_type`: `str` (`'electricite'`, `'plomberie'`, etc.)
* `reported_at`: `date`
* `assigned_to`: `str`
* `comment`: `str`
* `status`: `str` (`'resolue'`, `'non-resolue'`)
* `photo_issue_url`: `str` (optional)
* `photo_invoice_url`: `str` (optional)
* `labor_cost`: `float` (optional)
* `created_at`: `datetime`
* `updated_at`: `datetime`

---

## **16. Maintenance Types**

* `id`: `str` (e.g., `'electricite'`)
* `label`: `str`

---

## **17. Maintenance Status Log**

* `id`: `str`
* `issue_id`: `str`
* `previous`: `str`
* `new`: `str`
* `changed_at`: `datetime`
* `changed_by`: `str` (nullable)

---

## **18. Financial Operations**

* `id`: `str`
* `date`: `date`
* `house_id`: `str`
* `type`: `str` (`'entree'`, `'sortie'`)
* `motif`: `str`
* `montant`: `float`
* `origine`: `str` (`'reservation'`, `'maintenance'`, `'checkin'`, `'manuel'`)
* `piece_jointe`: `str` (optional)
* `editable`: `bool`
* `created_at`: `datetime`
* `updated_at`: `datetime`

---

## **19. File Attachments**

* `id`: `str`
* `operation_id`: `str`
* `filename`: `str`
* `mime_type`: `str`
* `uploaded_at`: `datetime`


## ERD (Entity Relationship Diagram)


### **Users & Authentication**

* `users(id, email, password_hash, role, created_at, last_login)`
* `auth_providers(id, provider_name, description)`
* `user_providers(id, user_id, provider_id, external_id, linked_at)`
* `login_attempts(id, user_id?, email, success, provider, ip_address?, timestamp)`
* `password_reset_requests(id, user_id, reset_token, requested_at, used_at?)`

---

### **Reservations System**

* `houses(id, name)`
* `reservations(id, house_id, guest_name, phone?, email?, checkin_date, checkout_date, advance_paid, created_at, updated_at)`
* `reservation_audit_log(id, reservation_id, action, timestamp, user_id)`

---

### **Checklists**

* `checklist_categories(id, name)`
* `checklist_items(id, house_id, step_number, category_id, description, product_required, type)`
* `house_checklist_status(id, house_id, item_id, is_completed, completed_at?, updated_by?)`
* `house_category_status(id, house_id, category_id, is_ready, ready_at?)`
* `task_completion_logs(id, house_id, item_id, user_id, completed, timestamp)`

---

### **House Occupancy & Availability**

* `house_daily_occupancy(id, house_id, date, is_occupied, source, updated_at?)`

---

### **Maintenance Tracking**

* `maintenance_issues(id, house_id, issue_type, reported_at, assigned_to, comment, status, photo_issue_url?, photo_invoice_url?, labor_cost?, created_at, updated_at)`
* `maintenance_types(id, label)`
* `maintenance_status_log(id, issue_id, previous, new, changed_at, changed_by?)`

---

### **Financial Records**

* `financial_operations(id, date, house_id, type, motif, montant, origine, piece_jointe?, editable, created_at, updated_at)`
* `file_attachments(id, operation_id, filename, mime_type, uploaded_at)`

---

### **Enum Notes** (used in multiple places)

* `operation_type`: `'entree'`, `'sortie'`
* `operation_origin`: `'reservation'`, `'maintenance'`, `'checkin'`, `'manuel'`
* `checklist_type`: `'nettoyage'`, `'vérification'`, `'entretien'`
* `issue_type`: `'electricite'`, `'plomberie'`, etc.

---


