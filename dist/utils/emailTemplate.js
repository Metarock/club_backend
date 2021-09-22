"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registrationEmail = exports.forgotemailTemplate = void 0;
const forgotemailTemplate = (clubname, cors, token) => __awaiter(void 0, void 0, void 0, function* () {
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
    `;
    return template;
});
exports.forgotemailTemplate = forgotemailTemplate;
const registrationEmail = (clubname, cors) => __awaiter(void 0, void 0, void 0, function* () {
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
    `;
    return template;
});
exports.registrationEmail = registrationEmail;
//# sourceMappingURL=emailTemplate.js.map