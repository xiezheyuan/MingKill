function getMyExtension(lib, game, ui, get, ai, _status) {
    var skills = {}
    var characters = {}
    var skill_translate = {}
    var character_translate = {}
    var character_intro = {}
    var file_characters = []

    characters.zhuyoucheng = ["male", "明", 3, ["mingkill_huizheng", "mingkill_renxian", "mingkill_wuchao"], ["明孝宗朱祐樘（1470年7月30日－1505年6月8日），明朝第九位皇帝（1487年－1505年在位），明宪宗朱见深第三子，生母为孝穆纪太后。 成化十一年（1475年），朱祐樘被册立为太子。成化二十三年（1487年），朱祐樘即位，年号“弘治” 。朱祐樘为人宽厚仁慈，躬行节俭，不近女色，勤于政事，广开言路。在位之初，贬斥方士李孜省、太监梁芳、外戚万喜等；遣散“传奉官”二千余人。又罢遣禅师、真人及法王、国师等一千余人。相继起用丘濬、徐溥、刘健、谢迁、李东阳等入阁，以王恕、马文升、刘大夏、戴珊等执掌六部。为解决财政危机，下诏减省光禄寺费用，屡次明令禁宗室、勋威侵占民田。朱祐樘重视司法，曾组织编纂《大明会典》，修订《问刑条例》。史称其统治为“弘治中兴”。虽在统治中后期宠信宦官李广，但能改过自新。不过此时土地、户籍、军伍严重空虚，亦出现一定统治危机。 弘治十八年（1505年），朱祐樘在乾清宫驾崩，在位十八年，享年三十六岁。谥号建天明道诚纯中正圣文神武至仁大德敬皇帝，庙号孝宗，葬于泰陵。 作为守成之君，朱祐樘在“法祖”的旗帜下，对祖制有完善与创新，革除前数朝诸项弊端，全面推行新政。在他的带领下，弘治君臣较好地处理了各种政治问题，营造了“中兴”的局面。因此，历代史家对朱祐樘的评价普遍较高，将其称颂为贤君，比于汉文帝、宋仁宗。"]];
    character_translate.zhuyoucheng = "朱祐樘";
    file_characters.push("zhuyoucheng.png");

    skills.mingkill_huizheng = {
        trigger: { player: 'useCardAfter' },
        direct: true,
        filter: function (event) {
            return ((get.type(event.card) == 'trick' || get.type(event.card) == 'delay') && event.card.isCard);
        },
        check: function (event, player) {
            if (player.storage.mingkill_renxian_mark != undefined) {
                return get.attitude(player, player.storage.mingkill_renxian_mark) >= 0;
            }
            else return true;
        },
        content: function () {
            'step 0'
            player.judge(function (card) {
                if (get.suit(card) == "heart" && player.maxHp == player.hp) return -2;
                if (get.color(card) != "red") return -2;
                else return 2;
            });
            'step 1'
            const suit = get.suit(result.card);
            if (suit == "heart") player.recover();
            if (suit == "diamond") player.draw(2);
        }
    }

    skills.mingkill_renxian_mark = {
        mark: 'character',
        intro: {
            content: '$任用您为他的心腹爱卿，并给予您技能【恢政】与【帝佑】直至他的下一个回合。',
        },
        onremove: function (player) {
            delete player.storage.mingkill_renxian_mark;
            player.removeSkill('mingkill_diyou');
            player.removeSkill('mingkill_huizheng');
        },
        trigger: { global: 'phaseBeginStart' },
        firstDo: true,
        charlotte: true,
        silent: true,
        filter: function (event, player) {
            return event.player == player.storage.mingkill_renxian_mark;
        },
        content: function () {
            player.removeSkill('mingkill_renxian_mark');
        },
    }

    skills.mingkill_diyou = {
        charlotte: true,
        trigger: { player: 'judgeEnd' },
        filter: function (event, player) {
            return get.position(event.result.card, true) == 'o' && get.color(event.result.card) == "red";
        },
        content: function () {
            player.storage.mingkill_renxian_mark.draw();
        }
    }

    skills.mingkill_renxian = {
        trigger: { player: 'phaseJieshuBegin' },
        usable: 1,
        direct: true,
        content: function () {
            'step 0'
            player.chooseTarget(false, "选择一名其他玩家，令其获得【恢政】与【帝佑】直至你的下一个回合。", function (card, player, target) {
                if (player == target) return false;
                return true;
            }).set('ai', function (target) {
                return get.attitude(_status.event.player, target);
            });
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                event.target = target;
                player.line(target);
            }
            else event.finish();
            'step 2'
            if (result.bool) {
                target.storage.mingkill_renxian_mark = player;
                target.addSkill("mingkill_huizheng");
                target.addSkill("mingkill_diyou");
                target.addSkill("mingkill_renxian_mark");
            }
        }
    }

    skills.mingkill_wuchao = {
        zhuSkill: true,
        trigger: { global: 'phaseAfter' },
        filter: function (event, player) {
            return event.player.getStat('kill') > 0;
        },
        content: function () {
            'step 0'
            let name = get.translation(trigger.player);
            trigger.player.chooseBool("是否发动【午朝】？", "令" + name + "执行一个额外的回合")
                .set('goon', get.attitude(trigger.player, player) > 0)
                .set('ai', () => _status.event.goon);
            'step 1'
            if (result.bool) {
                player.line(trigger.player, 'thunder');
                trigger.player.insertPhase();
            }
        }
    }

    skill_translate.mingkill_huizheng = "恢政";
    skill_translate.mingkill_huizheng_info = "当你使用一张普通锦囊牌或延时锦囊牌结算后，你可以进行判定。若结果为：♥：你摸两张牌；♦：你回复 1 点体力。";
    skill_translate.mingkill_renxian = "任贤";
    skill_translate.mingkill_renxian_info = "结束阶段，你可以令一名其他玩家获得【恢政】与【帝佑】直至你的下一个回合。";
    skill_translate.mingkill_diyou = "帝佑";
    skill_translate.mingkill_diyou_info = "锁定技。当你的红色判定牌生效后，你令朱祐樘摸一张牌。";
    skill_translate.mingkill_renxian_mark = "任贤";
    skill_translate.mingkill_wuchao = "午朝";
    skill_translate.mingkill_wuchao_info = "主公技。一名玩家的结束阶段，如果其于本回合内杀死过角色，则你可以令其执行一个额外的回合。";

    return {
        skills: skills,
        characters: characters,
        skill_translate: skill_translate,
        character_translate: character_translate,
        file_characters: file_characters,
        character_intro: character_intro
    }
}

game.import("extension", function (lib, game, ui, get, ai, _status) {
    var myExtension = getMyExtension(lib, game, ui, get, ai, _status);
    return {
        name: "明朝杀",
        content: function (config, pack) { },
        precontent: function () { },
        config: {},
        help: {},
        package: {
            character: {
                character: myExtension.characters,
                translate: myExtension.character_translate
            },
            card: {
                card: {
                },
                translate: {
                },
                list: [],
            },
            skill: {
                skill: myExtension.skills,
                translate: myExtension.skill_translate
            },
            intro: "",
            author: "xiezheyuan",
            diskURL: "",
            forumURL: "",
            version: "1.0",
        },
        files: {
            character: myExtension.file_characters,
            card: [],
            skill: []
        },
        characterIntro: myExtension.character_intro
    }
})
