function formatPrayerTimesToAMPM(timings) {
    const todayStr = new Date().toDateString();
    const format = (timeStr) =>
        new Date(todayStr + ' ' + timeStr).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit'
        });
    return {
        Fajr: format(timings.Fajr),
        Dhuhr: format(timings.Dhuhr),
        Asr: format(timings.Asr),
        Maghrib: format(timings.Maghrib),
        Isha: format(timings.Isha)
    };
}

async function getPrayerTimes() {
    const output = document.getElementById("output");
    output.innerHTML = "Getting location...";
    if (!navigator.geolocation) {
        output.innerHTML = "Geolocation is not supported by your browser.";
        return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        output.innerHTML = "Fetching prayer times...";
        const res = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=2`);
        const data = await res.json();
        const timings = data.data.timings;
        const maghribStr = timings.Maghrib;
        const fajrStr = timings.Fajr;

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
        const geoData = await geoRes.json();
        const city = geoData.address.city || geoData.address.town || geoData.address.village;
        const country = geoData.address.country;
        const locationName = `${city}, ${country}`;

        const now = new Date();
        const maghrib = new Date(now.toDateString() + ' ' + maghribStr);
        let fajr = new Date(now.toDateString() + ' ' + fajrStr);
        if (fajr <= maghrib) fajr.setDate(fajr.getDate() + 1);

        const durationMs = fajr - maghrib;
        const thirdMs = durationMs / 3;
        const lastThirdStart = new Date(fajr - thirdMs);

        const formattedTimes = formatPrayerTimesToAMPM(timings);
	
	const hijriDate = data.data.date.hijri;
	const hijriDay = hijriDate.day;
	const hijriMonth = hijriDate.month.en;
	const hijriYear = hijriDate.year;
	    
        output.innerHTML = `
        <div class="flex-wrapper">
            <div class="box">
                <p><strong>Location: </strong>${locationName}</p>
		<p><strong>Today: </strong>${hijriDay} ${hijriMonth} ${hijriYear} AH</p>
                <p><strong>Last Third of Night Starts:</strong> ${lastThirdStart.toLocaleTimeString()}</p>
				<p>
					<div class="arabic-verse">
						وَمِنَ ٱلَّيْلِ فَتَهَجَّدْ بِهِۦ نَافِلَةًۭ لَّكَ عَسَىٰٓ أَن يَبْعَثَكَ رَبُّكَ مَقَامًۭا مَّحْمُودًۭا &#x06DD;
					</div>
				</p>
            </div>
            <div class="box">
                <h3>My Daily Prayer Times</h3>
                <table>
                    <tr><th>Prayer</th><th>Time (Waqt Begins)</th></tr>
                    <tr><td>Fajr</td><td>${formattedTimes.Fajr}</td></tr>
                    <tr><td>Dhuhr</td><td>${formattedTimes.Dhuhr}</td></tr>
                    <tr><td>Asr</td><td>${formattedTimes.Asr}</td></tr>
                    <tr><td>Maghrib</td><td>${formattedTimes.Maghrib}</td></tr>
                    <tr><td>Isha</td><td>${formattedTimes.Isha}</td></tr>
                </table>
            </div>
        </div>
        `;
    }, () => {
        output.innerHTML = "Unable to get your location.";
    });
}
