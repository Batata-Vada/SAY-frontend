# SAY Project Report : Yuvraj

## 1. Initial Setup and Backend–Frontend Communication

- I did the setup for both backend and frontend repositories.
- I Set up the frontend using Next.js, with TypeScript.
- Started working on the backend setup using Flask and SQLAlchemy.
- Established Connection between the frontend server and the backend server using Flask-CORS.
- Worked on making sure that the frontend could send requests to the backend and receive responses correctly.
- Set up the basic application flow so that new features could be added without having to rebuild the initial structure.

## 2. Authentication and Authorization

- Implemented the initial user registration, login, and logout functionality. (Later improved by Siddhant, in discussion phase to migrate to OAuth)
- Setup password hashing and password verification on the backend, using bcrypt.
- Implemented token-based authentication to identify logged-in users.
- Added database-backed session management.
- Created authentication middleware to protect endpoints that require a logged-in user.
- Added separate authorization checks for administrator-only operations.
- Added decorators: `@admin_required` & `@login_required`
- Continued by integrating the authentication flow with the frontend.
- Made sure that the frontend could send the authentication token when making requests to protected backend APIs.

## 3. User Management and Privileges

- Created APIs to retrieve user information.
- Implemented functionality to list registered users for the administrator dashboard.
- Added functionality to promote a user to an administrator.
- Added functionality to delete users.
- Connected these APIs to the frontend administrator dashboard.
- Worked on displaying user details and privileges in a table.
- Added conditional navigation so that administrators and regular users get the appropriate navigation options.

## 4. Landing Page

- Worked on the landing page of SAY.
- Added the main introduction to explain what SAY is supposed to do.
- Came up with the initial theme to use dark bg with white fg and green-ish accent as the overall theme.
- Added sections explaining the basic workflow of the platform.
- Added navigation links to help users get to the relevant parts of the website.
- Updated the application metadata and title to use SAY instead of the default Next.js template information.

## 5. Navigation Bar

- Created the main navigation bar for the website.
- Added links to the home page, practice page, and submissions page.
- Added an account menu for logged-in users.
- Added the logout option.
- Made the navigation conditional based on the user privilege level who is logged in.
- Added administrator-specific navigation options.
- Worked on keeping the navigation consistent across different pages.

## 6. Competitive-Programming Practice Page

- Created the practice page where users can browse available programming problems.
- Added problem titles, numbering, and difficulty information. (with dummy data as of now.)
- Made individual problems accessible through their own routes.
- Worked on the problem workspace where users can read the problem statement and examples.
- Added the interface for selecting a programming language and writing code.
- Connected the submission interface to the backend.
- Worked on making the practice workflow consistent with the rest of the website.

## 7. Code Submission API and Storage

- Created backend APIs to receive code submissions from the frontend.
- Connected the submission interface to the backend.
- Made the backend associate submissions with the relevant user and problem.
- Added support for storing submitted source-code files locally on the server.
- Added database records to store submission metadata.
- Stored information such as the user, problem, programming language, filename, and submission timestamp.
- Added support for the programming languages currently handled by the submission workflow, including C++ and Python.
- Worked on making sure that submissions could be stored and retrieved later.

## 8. My Submissions Page

- Created the backend API for retrieving a user's submissions.
- Made the API return submissions belonging to the authenticated user.
- Added support for filtering submissions by programming language and problem.
- Created the frontend page to display submission history.
- Used a table to display the submission information.
- Connected the frontend filters to the backend API.
- Made it easier for users to check their previous submissions without having to submit the same code again.

## 9. User Settings Page

- Created the user settings page to let users manage their account information.
- Connected the settings page to the backend APIs.
- Added functionality to update the user's name.
- Added functionality to change the account password.
- Added a section for managing social-profile links.
- Added support for links to platforms such as Instagram, X, LinkedIn, LeetCode, Codeforces, and CodeChef.
- Added individual visibility settings for supported social-profile links.
- Added an education section to let users enter their academic information.
- Added fields for institution, degree, field of study, and start and end years.
- Worked on connecting the settings forms to the backend so that changes could be saved.
- Added error handling for failed requests and invalid input.

## 10. Public User Profile

- Created the frontend page for displaying a user's public profile.
- Added support for viewing a profile using the user's username.
- Worked on the `/users/me` route so that a logged-in user can access their own profile without manually entering their username.
- Connected the profile page to the backend profile APIs.
- Added support for displaying the user's available profile information.
- Added support for displaying educational information.
- Added support for displaying social and competitive-programming profile links.
- Connected the profile display to the visibility settings configured by the user.
- Worked on making sure that information marked as private is not unnecessarily displayed on the public profile.
- Coordinated the frontend work with the backend APIs and database models required for profile information.

## TODO for the next stage:

- [ ] Adding the admin dashboard for admins to retrieve information such as total registered users, problems solved etc.
- [ ] Adding a dashboard to user profile listing total submissions made by that user, and more relevant information.
- [ ] Adding a graph to user profile to display their status.
- [ ] Issues Page and Ticket generation via frontend.
- [ ] Admin Support for Tickets, notifying admins etc.
- [ ] Forgot Password recovery via email.
- [ ] Questions right now displayed on frontend are dummy questions, so construct a Table and fetch questions from Backend.
- [ ] General Discussion Forum.
- [ ] Migrating authentication to OAuth, with Siddhant.
- [ ] Initialize Deployment Phase : Dockerizing Everything.
