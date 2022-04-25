<?php

// First check if a username was provided.
if (!isset($_SERVER['PHP_AUTH_USER'])) {
    // If no username provided, present the auth challenge.
    header('WWW-Authenticate: Basic realm="CFS Finder"');
    header('HTTP/1.0 401 Unauthorized');
    // User will be presented with the username/password prompt
    // If they hit cancel, they will see this access denied message.
    echo '<p>Access denied. You did not enter a password.</p>';
    exit; // Be safe and ensure no other content is returned.
}

// If we get here, username was provided. Check password.
if ($_SERVER['PHP_AUTH_USER'] == 'nonok' && $_SERVER['PHP_AUTH_PW'] == 'xvTvTdkkJ7wvV3Ls.qEk') {
    include_once("index.html");
} else {
    echo '<p>Access denied! You do not know the password.</p>';
}