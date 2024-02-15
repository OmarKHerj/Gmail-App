document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.getElementById('compose-form').onsubmit = send_email;
    
  
   
  // By default, load the inbox
  load_mailbox('inbox');
});

function view_email(id){
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#detail-view').style.display = 'block';
  
      document.getElementById('detail-view').innerHTML = `<div><h3 style="display: flex;flex-direction: row-reverse;align-content: flex-end;flex-wrap: wrap;justify-content: center;">${email.subject}</h3>
      <h4>From: ${email.sender}</h4> 
      <h4>To: ${email.recipients}</h4>

      <p style="display:flex; flex-direction: row; justify-content: flex-end;";> ${email.timestamp}</p>
    
      <hr>
      <strong>${email.body}</strong></div>
      <hr>
      
      `;
      
      // ... do something else with email ...
        if(~email.read){
        fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
        read: true
      })
    })
  }
  

  // Create the archive/unarchive button based on the mailbox
  const archiveButton = document.createElement('button');
  archiveButton.innerHTML = email.archived ? 'Unarchive' : 'Archive';
  archiveButton.className= email.archived ? 'btn btn-sm btn-outline-primary' : 'btn btn-sm btn-outline-primary';
  archiveButton.style.display = 'justify-content: center;'; 
  archiveButton.style.width = '100%';
  archiveButton.addEventListener('click', function() {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
          archived: !email.archived
      })
    })
    .then(() => {
      // Load the user's inbox after archiving/unarchiving the email
      load_mailbox('archive');
      localStorage.clear();
      document.getElementById('detail-view').innerHTML = '';
    })
   
  });

  // Append the archive/unarchive button to the detail view
  document.getElementById('detail-view').append(archiveButton);

  // Reply Button 
  const replyButton = document.createElement('button');
  replyButton.innerHTML = 'Reply';
  replyButton.className= 'btn btn-sm btn-outline-info';
  replyButton.style.display = 'justify-content: center;'; 
  replyButton.style.width = '100%';
  replyButton.addEventListener('click', function() {

    compose_email();
    localStorage.clear();
    document.getElementById('detail-view').innerHTML = '';
    
    document.getElementById('compose-recipients').value = email.sender;
    // Check if the subject line already starts with "Re: "
  if (!email.subject.startsWith('Re: ')) {
    document.getElementById('compose-subject').value = `Re: ${email.subject}`;
  } else {
    document.getElementById('compose-subject').value = email.subject;
  }
  
    document.getElementById('compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
  })
  document.getElementById('detail-view').append(replyButton);

  
  });
}

  




function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Render each email in its own box
    emails.forEach(email => {
      const newemail = document.createElement('div');
      newemail.classList.add('email-box');
     
      newemail.innerHTML = `<hr>
        <p>From: ${email.sender}</p>
        <p>Subject: ${email.subject}</p>
        <p>Timestamp: ${email.timestamp}</p>
        <hr>
      ` ;
      newemail.classList.add(email.read ? 'read' : 'unread');
      newemail.addEventListener('click', function(){
        view_email(email.id);
      });
      document.querySelector('#emails-view').appendChild(newemail);
    });
  });
}

function send_email(){
  

  const subject=document.getElementById('compose-subject').value;
  const recipients=document.getElementById('compose-recipients').value;
  const body=document.getElementById('compose-body').value;
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      
    // Clear the localStorage after the API response
    localStorage.clear();

    // Load the sent mailbox after the API response
    load_mailbox("sent");
  })
  .catch(error => {
    console.error('An error happened while sending the email:', error);
  });
  

  
  return false;
  
  
 
}

