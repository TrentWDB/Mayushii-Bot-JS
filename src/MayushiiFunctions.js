const GOD_ID = 140320644540792832;

const MayushiiFunctions = class MayushiiFunctions {
    static isOwner(guild, member) {
        return guild.ownerID === member.id || GOD_ID === member.id;
    }

    static isGod(member) {
        return member.id === GOD_ID;
    }
};