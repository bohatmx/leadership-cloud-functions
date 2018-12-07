
module.exports = function (){

    this.htmlEmail = function(user, url){
        // create welcome email
        var password = user.password;
        var firstName = user.firstName;
        let companyID = user.companyID;
        let email = user.email;

        var msg = "";

        // OneConnect Welcome Email
        if(companyID == "-LDVbbRyIMhukVtTVQ0n"){
            msg = '<b>Dear '+firstName+',</b><br><br>';
            msg += '<b>An important message from the CEO:</b><br><br>';
            msg += 'Dear Colleague <br><br>';
            msg += 'We have launched the Global Leadership Platform App inside OneConnect Group – your log in details are below. The App will be used for several purposes:<br><br>';
            msg += '<ol>';
            msg += '<li>More effective communication from my office, to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee will receive notifications on their phone/App/laptop when I send a message. Analytics will give me the ability to see who read it and who didn’t. You will be able to comment on my communications. Please do. My messages will land under the “Organisational” function on the App menu.</li><br>';
            msg += '<li>This platform will create leadership fitness in our organisation. If you engage it on a regular basis you will become a better leader and human being. You, our organisation and society will benefit from this.</li><br>';
            msg += '<li>Please make use of the Personal Leadership Development Plan (PLDP) that you can access from anywhere on the App. On it is an explanatory video from Adriaan Groenewald, one of the co-founders of this platform.</li><br>';
            msg += '<li>On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.</li><br>';
            msg += '<li>On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow them as well.</li><br>';
            msg += '<li>Please familiarise yourself with the T’s & C’s on the App.</li><br>';
            msg += '<li>This GLP is a product that we are taking to market, so please be aware that our use of it also serves as a live pilot, while we benefit as an organisation and individuals.</li><br><br>';
            msg += '</ol>';
            msg += 'You will discover much more about our company Global Leadership Platform as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline.<br>';
            msg += 'I look forward to going on this leadership journey with you.<br><br>';
            msg += 'Please find below your Login Credentials and Link to the App: <br><br>';
            msg += 'App Link: '+url+' <br>';
            msg += 'Username: '+email+'<br>';
            msg += 'Password: '+password+'<br><br>';
            msg += 'Kindly ensure to change your password when you first login to the App. <br><br>';
            msg += '<b>Best Regards,</b> <br>';
            msg += '<b>Global Leadership Platform.</b><br>';
        }
        // Edcon Welcome Email
        else if((companyID == "-LOs4iZh3Y9LSiNtpWlH") || (companyID == "-LBPcsCl4Dp7BsYB8fjE") || (companyID == "-LNUyClmWi7ezjSI5E2q") ){
            msg = '<b>Dear '+firstName+',</b><br><br>';
            msg += '<b>An important message from the CEO:</b><br><br>';
            msg += 'Dear Colleague <br><br>';
            msg += 'For us to take Edcon to its full potential, quality leadership is key. Every one of us – including myself – can and are always growing as leaders. It’s a never ending journey.<br><br>';
            msg += 'To assist with this we are launching the Edcon Leadership Platform (ELP) inside Edcon Group – your log in details are below. The Platform will be phased in, soon to assist with the following:<br><br>';
            msg += '<ol>';
            msg += '<li>More effective leadership communication from my office – and eventually from every CEO in the groups office to their people - to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee registered on the platform will receive notifications (including via email) on their phone/App/laptop when I send a message. Analytics will give me the ability to see what my message penetration is - who read it and who didn’t. You will be able to comment on communications. Please do. Messages will land under the “Organisational” function on the App menu.</li><br>';
            msg += '<li>This platform will assist with leadership fitness in our organisation. We do a lot of leadership development in Edcon, but there after leaders go back into the business and much of that training fades away – in a way leaders don’t always remain leadership fit. If you engage ELP on a regular basis you will become a “fitter” leader and by default a better human being. You, our organisation and society will benefit from this.</li><br>';
            msg += '<li>Please make use of the Personal Leadership Development Plan (My PLDP) that you can access from anywhere on the ELP, including the menu. On it is an explanatory video from Adriaan Groenewald, one of the co-founders of this platform. In time key business drivers will be programmed into your PLDP.</li><br>';
            msg += '<li>On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.</li><br>';
            msg += '<li>On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow “Daily” as well.</li><br>';
            msg += '<li>Please familiarise yourself with the T’s & C’s and tutorial videos on the menu. Some of these are related to the public App that’s out there, but will still be of value to you.</li><br>';
            msg += '</ol>';
            msg += 'You will discover much more about our ELP (Edcon Leadership Platform) as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline.<br>';
            msg += 'Together we can take our leadership journey and Edcon to the next level.<br><br>';
            msg += 'Please find below your Login Credentials and Link to the ELP, which you can access from any devise – laptop, phone or tablet: <br><br>';
            msg += 'App Link: '+url+' <br>';
            msg += 'Username: '+email+'<br>';
            msg += 'Password: '+password+'<br><br>';
            msg += 'Kindly ensure to change your password when you first login to the App. <br><br>';
            msg += 'Please note that one of the following browsers is required on your device for the Leadership Platform to function efficiently.<br>';
            msg += '<ul>';
            msg += '<li>Windows device: Chrome or Firefox (latest version)</li><br>';
            msg += '<li>Android device: Chrome  Firefox (latest version)</li><br>';
            msg += '<li>iOS/OSX device: Chrome, Firefox or Safari (latest version)</li><br>';
            msg += '</ul>';
            msg += 'If you do not have the Chrome browser, please log a call with IT Help Desk : 012 642 4140 (National, South African number)<br>';
            msg += '+27 (0)12 642 4140 (International number)<br>';
            msg += 'E-mail queries to edcon.servicedesk@ourservicedesk.com<br><br>';
            msg += '<b>Best Regards,</b> <br>';
            msg += '<b>Global Leadership Platform.</b><br>';
        }
        // BLSA Welcome Email
        else if(companyID == "-LT2GkDrMhj3Tsx7KCme"){
            msg = '<b>Dear BLSA Colleagues,</b><br><br>';
            msg += '<b>An important message from our CEO:</b><br><br>';
            msg += 'Dear Colleague <br><br>';
            msg += 'For us to take BLSA to its full potential, quality leadership on all fronts is key. Every one of us – including myself – can and are always growing as leaders. It’s a never ending journey.<br><br>';
            msg += 'To assist with this and to eventually extend our vision into broader society we are launching the BLSA Leadership Platform Progressive Web Based App – your log in details are below. The Platform will be phased in, soon to assist with the following:<br><br>';
            msg += '<ol>';
            msg += '<li>More effective leadership communication from my office to BLSA employees – and eventually to member CEO’s - to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee registered on the platform will receive notifications (including via email) on their phone/App/laptop when I send a message. Analytics will give me the ability to see what my message penetration is - who read it and who didn’t. You will be able to comment on communications. Please do. Messages will land under the “Organisational” function on the App menu.</li><br>';
            msg += '<li>This platform will assist with personal and organisational leadership fitness. We do a lot of leadership development in society, but there after leaders go back into the business and much of that training disappears – in a way leaders don’t always remain leadership fit. If you engage this platform on a regular basis you will become a “fitter” leader and by default a better human being. You, our organisation and society will benefit from this.</li><br>';
            msg += '<li>Please make use of the Personal Leadership Development Plan (My PLDP) that you can access from anywhere on the platform, including the menu. On it is an explanatory video. In time we may programme key business drivers into the PLDP.</li><br>';
            msg += '<li>On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.</li><br>';
            msg += '<li>On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow “Daily” as well.</li><br>';
            msg += '<li>Please familiarise yourself with the T’s & C’s and tutorial videos on the menu. Some of these are related to the public App that’s out there, but will still be of value to you.</li><br>';
            msg += '</ol>';
            msg += 'You will discover much more about our BLSA Leadership Platform as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline.<br>';
            msg += 'Together we can take personal, BLSA and our countries leadership journey to the next level.<br><br>';
            msg += 'Please find below your Login Credentials and Link to the App, which you can access from any devise – laptop, phone or tablet. Also see short tutorial that explains how you could create an App icon on your phone: <br><br>';
            msg += 'App Link: '+url+' <br>';
            msg += 'Username: '+email+'<br>';
            msg += 'Password: '+password+'<br><br>';
            msg += 'After accessing the App, create an icon on your phone. See how to on an iphone. If you have an android the principle will be the same: https://youtu.be/YiFQ8GjdjL8 <br><br>';
            msg += 'Kindly ensure to change your password when you first login to the App. <br><br>';
            msg += 'Please note that one of the following browsers is required on your device for the Leadership Platform to function efficiently.<br>';
            msg += '<ul>';
            msg += '<li>Windows device: Chrome or Firefox (latest version)</li><br>';
            msg += '<li>Android device: Chrome  Firefox (latest version)</li><br>';
            msg += '<li>iOS/OSX device: Chrome, Firefox or Safari (latest version)</li><br>';
            msg += '</ul>';
            msg += '<br><br>';
            msg += '<b>Best Regards,</b> <br>';
            msg += '<b>Global Leadership Platform.</b><br>';
        }
        else{
            msg = '<b>Dear '+firstName+',</b><br><br>';
            msg += 'We would like to welcome you to Global Leadership Platform.<br><br>';
            msg += 'Please find below your Login Credentials and Link to the App: <br><br>';
            msg += 'App Link: '+url+' <br>';
            msg += 'Username: '+email+'<br>';
            msg += 'Password: '+password+'<br><br>';
            msg += 'Kindly ensure to change your password when you first login to the App. <br><br>';
            msg += '<b>Best Regards,</b> <br>';
            msg += '<b>Global Leadership Platform.</b><br>';
        }

        return msg;
        
    }
    this.plainEmail = function(user, url){
        // create welcome email
        var password = user.password;
        var firstName = user.firstName;
        let companyID = user.companyID;
        let email = user.email;
        var msgPlain = "";

        if(companyID == "-LDVbbRyIMhukVtTVQ0n"){
            msgPlain = 'Dear '+firstName+',';
            msgPlain += 'An important message from the CEO:';
            msgPlain += 'Dear Colleague ';
            msgPlain += 'We have launched the Global Leadership Platform App inside OneConnect Group – your log in details are below. The App will be used for several purposes:';
            msgPlain += '   1. More effective communication from my office, to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee will receive notifications on their phone/App/laptop when I send a message. Analytics will give me the ability to see who read it and who didn’t. You will be able to comment on my communications. Please do. My messages will land under the “Organisational” function on the App menu.';
            msgPlain += '   2. This platform will create leadership fitness in our organisation. If you engage it on a regular basis you will become a better leader and human being. You, our organisation and society will benefit from this.';
            msgPlain += '   3. Please make use of the Personal Leadership Development Plan (PLDP) that you can access from anywhere on the App. On it is an explanatory video from Adriaan Groenewald, one of the co-founders of this platform.';
            msgPlain += '   4. On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.';
            msgPlain += '   5. On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow them as well.';
            msgPlain += '   6. Please familiarise yourself with the T’s & C’s on the App.';
            msgPlain += '   7. This GLP is a product that we are taking to market, so please be aware that our use of it also serves as a live pilot, while we benefit as an organisation and individuals.';
            msgPlain += 'You will discover much more about our company Global Leadership Platform as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline.';
            msgPlain += 'I look forward to going on this leadership journey with you.';
            msgPlain += 'Please find below your Login Credentials and Link to the App: ';
            msgPlain += 'App Link: '+url;
            msgPlain += 'Username: '+email+'';
            msgPlain += 'Password: '+password+'';
            msgPlain += 'Kindly ensure to change your password when you first login to the App. ';
            msgPlain += 'Best Regards, ';
            msgPlain += 'Global Leadership Platform.';
        }
        // Edcon Welcome Email
        else if((companyID == "-LOs4iZh3Y9LSiNtpWlH") || (companyID == "-LBPcsCl4Dp7BsYB8fjE") || (companyID == "-LNUyClmWi7ezjSI5E2q") ){
            msgPlain = 'Dear '+firstName+',';
            msgPlain += 'An important message from the CEO:';
            msgPlain += 'Dear Colleague ';
            msgPlain += 'For us to take Edcon to its full potential, quality leadership is key. Every one of us – including myself – can and are always growing as leaders. It’s a never ending journey.';
            msgPlain += 'To assist with this we are launching the Edcon Leadership Platform (ELP) inside Edcon Group – your log in details are below. The Platform will be phased in, soon to assist with the following:';
            msgPlain += '   1. More effective leadership communication from my office – and eventually from every CEO in the groups office to their people - to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee registered on the platform will receive notifications on their phone/App/laptop when I send a message. Analytics will give me the ability to see what my message penetration is - who read it and who didn’t. You will be able to comment on communications. Please do. Messages will land under the “Organisational” function on the App menu.';
            msgPlain += '   2. TThis platform will assist with leadership fitness in our organisation. We do a lot of leadership development in Edcon, but there after leaders go back into the business and much of that training fades away – in a way leaders don’t always remain leadership fit. If you engage ELP on a regular basis you will become a “fitter” leader and by default a better human being. You, our organisation and society will benefit from this.';
            msgPlain += '   3. Please make use of the Personal Leadership Development Plan (My PLDP) that you can access from anywhere on the ELP, including the menu. On it is an explanatory video from Adriaan Groenewald, one of the co-founders of this platform. In time key business drivers will be programmed into your PLDP.';
            msgPlain += '   4. On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.';
            msgPlain += '   5. On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow “Daily” as well.';
            msgPlain += '   6. Please familiarise yourself with the T’s & C’s and tutorial videos on the menu. Some of these are related to the public App that’s out there, but will still be of value to you.';
            msgPlain += 'You will discover much more about our ELP (Edcon Leadership Platform) as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline. ';
            msgPlain += 'Together we can take our leadership journey and Edcon to the next level.';
            msgPlain += 'Please find below your Login Credentials and Link to the ELP, which you can access from any devise – laptop, phone or tablet: ';
            msgPlain += 'App Link: '+url+' ';
            msgPlain += 'Username: '+email+' ';
            msgPlain += 'Password: '+password+' ';
            msgPlain += 'Kindly ensure to change your password when you first login to the App. ';
            msgPlain += 'Please note that one of the following browsers is required on your device for the Leadership Platform to function efficiently. Windows device: Chrome or Firefox (latest version) Android device: Chrome  Firefox (latest version) iOS/OSX device: Chrome, Firefox or Safari(latest version) ';
            msgPlain += 'If you do not have the Chrome browser, please log a call with IT Help Desk : 012 642 4140 (National, South African number) +27 (0)12 642 4140 (International number) E-mail queries to edcon.servicedesk@ourservicedesk.com ';
            msgPlain += ' ';
            msgPlain += 'Best Regards, ';
            msgPlain += 'Global Leadership Platform.';
        }
        // BLSA Welcome Email
        else if(companyID == "-LT2GkDrMhj3Tsx7KCme"){
            msgPlain = 'Dear BLSA Colleagues,';
            msgPlain += 'An important message from our CEO:';
            msgPlain += 'Dear Colleague ';
            msgPlain += 'For us to take BLSA to its full potential, quality leadership on all fronts is key. Every one of us – including myself – can and are always growing as leaders. It’s a never ending journey.';
            msgPlain += 'To assist with this and to eventually extend our vision into broader society we are launching the BLSA Leadership Platform Progressive Web Based App  – your log in details are below. The Platform will be phased in, soon to assist with the following:';
            msgPlain += '   1. More effective leadership communication from my office to BLSA employees – and eventually to member CEO’s - to expedite strategy execution, strengthen culture, improve adherence to values and much more. Every employee registered on the platform will receive notifications on their phone/App/laptop when I send a message. Analytics will give me the ability to see what my message penetration is - who read it and who didn’t. You will be able to comment on communications. Please do. Messages will land under the “Organisational” function on the App menu.';
            msgPlain += '   2. This platform will assist with personal and organisational leadership fitness. We do a lot of leadership development in society, but there after leaders go back into the business and much of that training disappears – in a way leaders don’t always remain leadership fit. If you engage this platform on a regular basis you will become a “fitter” leader and by default a better human being. You, our organisation and society will benefit from this.';
            msgPlain += '   3. Please make use of the Personal Leadership Development Plan (My PLDP) that you can access from anywhere on the platform, including the menu. On it is an explanatory video. In time we may programme key business drivers into the PLDP.';
            msgPlain += '   4. On the menu is a function “Global Contributors”. Please keep an eye out as there will be a growing group of top leaders, experts and authors here that add leadership content to the platform. You may choose to follow who you wish – as we do on all social media platforms - and this means you receive notifications when they post.';
            msgPlain += '   5. On the menu is a “Daily” function, which is Leadership Platform sharing daily leadership messages (mostly based on interviews with top/interesting leaders) to assist you on your leadership journey. You may choose to follow “Daily” as well.';
            msgPlain += '   6. Please familiarise yourself with the T’s & C’s and tutorial videos on the menu. Some of these are related to the public App that’s out there, but will still be of value to you.';
            msgPlain += 'You will discover much more about our BLSA Leadership Platform as you use it. And, this will be a growing, changing platform with new and dynamic features in the pipeline. ';
            msgPlain += 'Together we can take personal, BLSA and our countries leadership journey to the next level.';
            msgPlain += 'Please find below your Login Credentials and Link to the App, which you can access from any devise – laptop, phone or tablet. Also see short tutorial that explains how you could create an App icon on your phone: ';
            msgPlain += 'App Link: '+url+' ';
            msgPlain += 'Username: '+email+' ';
            msgPlain += 'Password: '+password+' ';
            msgPlain += 'Kindly ensure to change your password when you first login to the App. ';
            msgPlain += 'Please note that one of the following browsers is required on your device for the Leadership Platform to function efficiently. Windows device: Chrome or Firefox (latest version) Android device: Chrome  Firefox (latest version) iOS/OSX device: Chrome, Firefox or Safari(latest version) ';
            msgPlain += 'After accessing the App, create an icon on your phone. See how to on an iphone. If you have an android the principle will be the same: https://youtu.be/YiFQ8GjdjL8 ';
            msgPlain += ' ';
            msgPlain += 'Best Regards, ';
            msgPlain += 'Global Leadership Platform.';
        }
        else{
            msgPlain = 'Dear '+firstName+',';
            msgPlain += 'We would like to welcome you to Global Leadership Platform.';
            msgPlain += 'Please find below your Login Credentials and Link to the App: ';
            msgPlain += 'App Link: '+url;
            msgPlain += 'Username: '+email+'';
            msgPlain += 'Password: '+password+'';
            msgPlain += 'Kindly ensure to change your password when you first login to the App. ';
            msgPlain += 'Best Regards, ';
            msgPlain += 'Global Leadership Platform.';
        }

        return msgPlain
        
    }

}