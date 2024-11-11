
export function getOffsetForLoc(loc: string, date: Date = new Date()): string {
    const opts: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      timeZone: loc,
      timeZoneName: 'short',
    };
  
    // Helper function to get the offset for a given language
    const getOffset = (lang: string): string => {
      return new Intl.DateTimeFormat(lang, opts)
        .formatToParts(date)
        .reduce((acc: Record<string, string>, part) => {
          acc[part.type] = part.value;
          return acc;
        }, {}).timeZoneName;
    };
  
    let offset: string = getOffset('en');
  
    // If the offset is an abbreviation, change language
    if (!/^UTC|GMT/.test(offset)) {
      offset = getOffset('fr');
    }
  
    // Remove 'GMT' or 'UTC' prefix from the offset
    return offset.substring(3);
}

export function getServerTimezone(): string {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

export function calculateTimezoneDifference(offset1: string, offset2: string): string {

  if(offset2 == '' || offset2 == null){
    offset2 = "+0";
  }

  // Helper function to convert timezone offset string to total minutes
  const parseOffsetToMinutes = (offset: string): number => {
    const [sign, hours, minutes = '0'] = offset.match(/([+-]?)(\d{1,2}):?(\d{2})?/)?.slice(1) ?? [];
    const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
    return sign === '-' ? -totalMinutes : totalMinutes;
  };

  // Convert both offsets to minutes
  const minutes1 = parseOffsetToMinutes(offset1);
  const minutes2 = parseOffsetToMinutes(offset2);

  // Calculate the difference in minutes
  const diffMinutes = minutes1 - minutes2;

  // Convert the difference back to hours and minutes
  const sign = diffMinutes >= 0 ? '+' : '-';
  const absoluteMinutes = Math.abs(diffMinutes);
  const resultHours = Math.floor(absoluteMinutes / 60);
  const resultMinutes = absoluteMinutes % 60;

  // Format the result as a string
  const result =  `${sign}${resultHours}${resultMinutes > 0 ? `:${String(resultMinutes).padStart(2, '0')}` : ''}`;

  if(result.includes("NaN")){
    return "0";
  } else {
    return result;
  }
}

export function addTime(baseTime: string, offset: string): string {
  // Step 1: Convert base time to Date object
  const baseHour = parseInt(baseTime);
  const date = new Date();
  date.setHours(baseHour, 0, 0, 0); // Set to base hour with 0 minutes and seconds

  // Step 2: Parse the offset (e.g., '+5:30' or '-1:15')
  const match = offset.match(/([+-])(\d+):(\d+)/);
  if (!match) {
    throw new Error("Invalid offset format");
  }

  const sign = match[1];
  const hoursOffset = parseInt(match[2]);
  const minutesOffset = parseInt(match[3]);

  // Step 3: Calculate the total offset in minutes
  const totalMinutesOffset = hoursOffset * 60 + minutesOffset;
  const adjustedMinutes = sign === '+' ? totalMinutesOffset : -totalMinutesOffset;

  // Step 4: Add the offset to the base time
  date.setMinutes(date.getMinutes() + adjustedMinutes);

  // Step 5: Format the result to 'HH:mm' format
  const resultHours = date.getHours().toString().padStart(2, '0');
  const resultMinutes = date.getMinutes().toString().padStart(2, '0');

  return `${resultHours}:${resultMinutes}`;
}