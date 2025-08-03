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

