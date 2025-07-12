import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// CORS headers
function setCorsHeaders(response: NextResponse) {
	response.headers.set('Access-Control-Allow-Origin', '*')
	response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
	response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
	return response
}

export async function OPTIONS() {
	return setCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json()
		const {
			name,
			email,
			phone,
			subject,
			message,
			propertyInterest,
			preferredContact,
		} = body

		// Validation
		if (!name || !email || !subject || !message) {
			return setCorsHeaders(
				NextResponse.json(
					{ error: 'Պարտադիր դաշտերը բացակայում են' },
					{ status: 400 }
				)
			)
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
		if (!emailRegex.test(email)) {
			return setCorsHeaders(
				NextResponse.json({ error: 'Անվավեր էլ. փոստի հասցե' }, { status: 400 })
			)
		}

		// Create transporter using Gmail SMTP
		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
				user: process.env.EMAIL_USER, 
				pass: process.env.EMAIL_APP_PASSWORD,
			},
		})

		// Armenian translations only
		const armenian = {
			newContact: 'Նոր հաղորդագրություն կայքից',
			contactDetails: 'Կապի մանրամասներ',
			name: 'Անուն',
			email: 'Էլ. փոստ',
			phone: 'Հեռախոս',
			subject: 'Թեմա',
			message: 'Հաղորդագրություն',
			propertyInterest: 'Գույքի հետաքրքրություն',
			preferredContact: 'Նախընտրելի կապի եղանակ',
			sentFrom: 'Ուղարկված է Chance Realty կայքից',
			thankYou: 'Շնորհակալություն ձեր հաղորդագրության համար',
			responseTime: 'Մենք կպատասխանենք ձեզ 2 ժամվա ընթացքում',
			quickActions: 'Արագ գործողություններ',
			reply: 'Պատասխանել',
			call: 'Զանգահարել',
			language: 'Լեզու',
			received: 'Ստացվեց',
			armeniaTime: 'Հայաստանի ժամանակ',
			leadingAgency: 'Հայաստանի առաջատար անշարժ գույքի գործակալություն',
			urgentContact: 'Շտապ կապի համար',
			messageReceived: 'Մենք ստացել ենք ձեր հաղորդագրությունը',
			workingHours: 'աշխատանքային ժամերին (10:00-22:00)',
			messageDetails: 'Ձեր հաղորդագրության մանրամասները',
		}

		const adminEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2563eb, #3730a3); color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9fafb; }
          .field { margin-bottom: 15px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #2563eb; }
          .label { font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .value { color: #374151; }
          .footer { text-align: center; padding: 20px; background: #374151; color: white; font-size: 12px; }
          .urgent { background: #fef2f2; border-left-color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 ${armenian.newContact}</h1>
          <p style="margin: 0; font-size: 14px;">chancerealty.am</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ${armenian.contactDetails}
          </h2>
          
          <div class="field">
            <div class="label">${armenian.name}:</div>
            <div class="value">${name}</div>
          </div>
          
          <div class="field">
            <div class="label">${armenian.email}:</div>
            <div class="value"><a href="mailto:${email}">${email}</a></div>
          </div>
          
          ${
						phone
							? `
          <div class="field">
            <div class="label">${armenian.phone}:</div>
            <div class="value"><a href="tel:${phone}">${phone}</a></div>
          </div>
          `
							: ''
					}
          
          <div class="field urgent">
            <div class="label">${armenian.subject}:</div>
            <div class="value"><strong>${subject}</strong></div>
          </div>
          
          ${
						propertyInterest
							? `
          <div class="field">
            <div class="label">${armenian.propertyInterest}:</div>
            <div class="value">${propertyInterest}</div>
          </div>
          `
							: ''
					}
          
          ${
						preferredContact
							? `
          <div class="field">
            <div class="label">${armenian.preferredContact}:</div>
            <div class="value">${preferredContact}</div>
          </div>
          `
							: ''
					}
          
          <div class="field" style="border-left-color: #059669;">
            <div class="label">${armenian.message}:</div>
            <div class="value" style="white-space: pre-wrap; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; background: #f9fafb;">${message}</div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px; border: 1px solid #bfdbfe;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              📧 <strong>${armenian.quickActions}:</strong><br>
              • ${armenian.reply}: <a href="mailto:${email}">${email}</a><br>
              ${
								phone
									? `• ${armenian.call}: <a href="tel:${phone}">${phone}</a><br>`
									: ''
							}
              • ${armenian.received}: ${new Date().toLocaleString('hy-AM', {
			timeZone: 'Asia/Yerevan',
		})} (${armenian.armeniaTime})
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>${armenian.sentFrom}</p>
          <p>🕐 ${armenian.responseTime}</p>
        </div>
      </body>
      </html>
    `

		// Auto-reply email to user (in Armenian)
		const userEmailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background: linear-gradient(135deg, #2563eb, #3730a3); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #f9fafb; }
          .footer { text-align: center; padding: 20px; background: #374151; color: white; }
          .success { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏠 Chance Realty</h1>
          <p style="margin: 0; font-size: 16px;">${armenian.thankYou}!</p>
        </div>
        
        <div class="content">
          <div class="success">
            <h2 style="color: #16a34a; margin-top: 0;">✅ ${
							armenian.thankYou
						}</h2>
            <p>${
							armenian.messageReceived
						} "<strong>${subject}</strong>" թեմայով։</p>
            <p><strong>${armenian.responseTime}</strong> ${
			armenian.workingHours
		}</p>
          </div>
          
          <h3>${armenian.messageDetails}:</h3>
          <ul style="background: white; padding: 20px; border-radius: 8px;">
            <li><strong>${armenian.name}:</strong> ${name}</li>
            <li><strong>${armenian.email}:</strong> ${email}</li>
            ${
							phone
								? `<li><strong>${armenian.phone}:</strong> ${phone}</li>`
								: ''
						}
            <li><strong>${armenian.subject}:</strong> ${subject}</li>
          </ul>
          
          <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb;">
            <h3 style="color: #1e40af; margin-top: 0;">📞 ${
							armenian.urgentContact
						}:</h3>
            <p>Հեռախոս: <a href="tel:+37441194646">+374 41 194 646</a><br>
            Email: <a href="mailto:chancerealty4646@gmail.com">chancerealty4646@gmail.com</a></p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Chance Realty</strong> | chancerealty.am</p>
          <p>${armenian.leadingAgency}</p>
        </div>
      </body>
      </html>
    `

		// Send email to admin
		await transporter.sendMail({
			from: `"Chance Realty Website" <${process.env.EMAIL_USER}>`,
			to: 'chancerealty4646@gmail.com',
			subject: `🏠 ${armenian.newContact}: ${subject}`,
			html: adminEmailContent,
			replyTo: email,
		})

		// Send auto-reply to user
		await transporter.sendMail({
			from: `"Chance Realty" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: `✅ ${armenian.thankYou} - Chance Realty`,
			html: userEmailContent,
		})

		console.log(`✅ Կապի ձև ուղարկված: ${email} - ${subject}`)

		return setCorsHeaders(
			NextResponse.json({
				success: true,
				message: 'Էլ. նամակները հաջողությամբ ուղարկվեցին',
			})
		)
	} catch (error) {
		console.error('❌ Էլ. նամակի ուղարկումը ձախողվեց:', error)
		return setCorsHeaders(
			NextResponse.json(
				{ error: 'Էլ. նամակ ուղարկելը ձախողվեց' },
				{ status: 500 }
			)
		)
	}
}
