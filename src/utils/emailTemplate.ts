


export const forgotemailTemplate = async (clubname: string, cors: string, token: string) => {
    const template = `
    <html>
        <body>
        <text>
        <p style="margin:10px 0;padding:0;color:#505050;font-family:Helvetica;font-size:22px;line-height:150%;text-align:left">Hi <span style="font-weight:bold;">${clubname}</span>,</p> please click on the link to
            <a href="${cors}/change-password/${token}">reset password</a>
        </text>
        
        <p>If you are not the user or was not meant to receive this. Please ignore this.</p>
        </body>
    </html>
    `
    return template as string;
}


export const registrationEmail = async (clubname: string, cors: string) => {
    const template = `
    <html>
        <body>
        <text>
        <p style="margin:10px 0;padding:0;color:#505050;font-family:Helvetica;font-size:22px;line-height:150%;text-align:left">Welcome <span style="font-weight:bold;">${clubname}</span> to the club!,</p> 
        
        please click on the link to redirect to the home page
            
        <a href="${cors}">click here</a>
        </text>
        <p>If you are not the user or was not meant to receive this. Please ignore this.</p>
        </body>
    </html>
    `
    return template as string;

}