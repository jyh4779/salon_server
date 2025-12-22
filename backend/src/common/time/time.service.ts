import { Injectable } from '@nestjs/common';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class TimeService {
    private readonly TIMEZONE = 'Asia/Seoul';

    /**
     * 현재 시간을 KST 기준으로 반환 (dayjs 객체)
     */
    now(): dayjs.Dayjs {
        return dayjs().tz(this.TIMEZONE);
    }

    /**
     * 입력받은 날짜/시간을 KST 기준으로 파싱
     * @param date Date 객체, 문자열, 혹은 dayjs 객체
     */
    parse(date: Date | string | dayjs.Dayjs): dayjs.Dayjs {
        // 이미 dayjs 객체라면 timezone만 설정해서 반환
        if (dayjs.isDayjs(date)) {
            return date.tz(this.TIMEZONE);
        }
        // 문자열인 경우, 단순 포맷팅된 문자열(예: '2023-01-01 10:00')을 
        // 해당 타임존(KST)에서의 시간으로 해석하기 위해 dayjs.tz(str, zone) 사용
        if (typeof date === 'string') {
            return dayjs.tz(date, this.TIMEZONE);
        }
        // Date 객체인 경우 (UTC), tz()를 통해 변환
        return dayjs(date).tz(this.TIMEZONE);
    }

    /**
     * 날짜를 포맷팅된 문자열로 반환
     * @param date 대상 날짜
     * @param formatStr 포맷 문자열 (기본값: YYYY-MM-DDTHH:mm:ss)
     */
    format(date: Date | string | dayjs.Dayjs, formatStr: string = 'YYYY-MM-DDTHH:mm:ss'): string {
        return this.parse(date).format(formatStr);
    }

    /**
     * 특정 시간이 시작 시간과 종료 시간 사이에 있는지 확인 (Inclusive)
     */
    isWithinRange(target: dayjs.Dayjs | string, start: dayjs.Dayjs | string, end: dayjs.Dayjs | string): boolean {
        const t = this.parse(target);
        const s = this.parse(start);
        const e = this.parse(end);
        return (t.isSame(s) || t.isAfter(s)) && (t.isSame(e) || t.isBefore(e));
    }

    /**
     * HH:mm 형식의 시간 문자열을 비교
     * @param timeStr 비교할 시간 (HH:mm)
     * @param startStr 시작 시간 (HH:mm)
     * @param endStr 종료 시간 (HH:mm)
     */
    isTimeWithinRange(timeStr: string, startStr: string, endStr: string): boolean {
        // 문자열 단순 비교 (형식이 HH:mm으로 보장된다면 가능)
        return timeStr >= startStr && timeStr <= endStr;
    }

    /**
     * DB에서 가져온 시간(Date or String)을 HH:mm 포맷으로 변환 (KST 기준)
     */
    toTimeStr(date: Date | string | null): string | null {
        if (!date) return null;
        return this.parse(date).format('HH:mm');
    }

    /**
     * DB에 UTC로 저장된 시간(Date)을 "UTC 기준" HH:mm 포맷으로 반환
     * (Prisma @db.Time 컬럼이 1970-01-01Txx:xx:00Z로 저장된 경우 사용)
     */
    toUtcTimeStr(date: Date | string | null): string | null {
        if (!date) return null;
        if (date instanceof Date) {
            return dayjs(date).utc().format('HH:mm');
        }
        // 문자열이나 Dayjs인 경우 parse 후 utc 변환
        return dayjs(date).utc().format('HH:mm');
    }

    /**
     * "HH:mm" 문자열을 받아 Prisma @db.Time 저장을 위한 Date 객체(1970-01-01Txx:xx:00Z)로 반환
     */
    parseUtcTime(timeStr: string): Date {
        return new Date(`1970-01-01T${timeStr}:00Z`);
    }
}
