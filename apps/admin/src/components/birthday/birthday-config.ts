export const BIRTHDAY = {
    founderFirstName: "Soumyajit",
    founderFullName: "Soumyajit Chakraborty",
    /**
     * Birthday in IST: August 9. `birthYear` lets the copy compute the
     * correct age ("24th") on every future birthday automatically.
     */
    month: 8,
    day: 9,
    birthYear: 2002,
    portraitUrl:
        "https://q3kifue2qs.ufs.sh/f/PH7dfSlVNmurpv4vNP0OAPFwI8Y4UDytc0psnWlQx7r1hqNB",
} as const;

export const CONFETTI_COLORS = [
    "#fbbf24",
    "#f59e0b",
    "#f472b6",
    "#ec4899",
    "#818cf8",
    "#6366f1",
    "#2dd4bf",
    "#a78bfa",
    "#f8fafc",
];

export function toOrdinal(value: number) {
    const rem10 = value % 10;
    const rem100 = value % 100;

    if (rem10 === 1 && rem100 !== 11) return `${value}st`;
    if (rem10 === 2 && rem100 !== 12) return `${value}nd`;
    if (rem10 === 3 && rem100 !== 13) return `${value}rd`;
    return `${value}th`;
}
