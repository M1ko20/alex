<?php
/**
 * Settings for the PHP side of the site. This folder is closed to the web
 * (see .htaccess), so nobody can read it from a browser.
 *
 * Copy this file to config.php and fill in the password. config.php is not in
 * git (the repository is public).
 */
return [
    // Heslo do administrace na /admin
    'admin_password' => '',

    // Kam se posílají zprávy z formuláře na webu
    'contact_email' => 'alexandratomanova06@gmail.com',

    // Odesílatel těch e-mailů. Prázdné = noreply@<doména webu>. Některé hostingy
    // vyžadují adresu, která na hostingu opravdu existuje.
    'mail_from' => '',
];
