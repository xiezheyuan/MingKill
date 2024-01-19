function getMyExtension(lib, game, ui, get, ai, _status) {
    var skills = {}
    var characters = {}
    var skill_translate = {}
    var character_translate = {}
    var character_intro = {}
    var file_characters = []

    characters.mingkill_zhuyoucheng = ["male", "明", 3, ["mingkill_huizheng", "mingkill_renxian", "mingkill_wuchao"]];
    character_intro.mingkill_zhuyoucheng = "明孝宗朱祐樘（1470年7月30日－1505年6月8日），明朝第九位皇帝（1487年－1505年在位），明宪宗朱见深第三子，生母为孝穆纪太后。 成化十一年（1475年），朱祐樘被册立为太子。成化二十三年（1487年），朱祐樘即位，年号“弘治” 。朱祐樘为人宽厚仁慈，躬行节俭，不近女色，勤于政事，广开言路。在位之初，贬斥方士李孜省、太监梁芳、外戚万喜等；遣散“传奉官”二千余人。又罢遣禅师、真人及法王、国师等一千余人。相继起用丘濬、徐溥、刘健、谢迁、李东阳等入阁，以王恕、马文升、刘大夏、戴珊等执掌六部。为解决财政危机，下诏减省光禄寺费用，屡次明令禁宗室、勋威侵占民田。朱祐樘重视司法，曾组织编纂《大明会典》，修订《问刑条例》。史称其统治为“弘治中兴”。虽在统治中后期宠信宦官李广，但能改过自新。不过此时土地、户籍、军伍严重空虚，亦出现一定统治危机。 弘治十八年（1505年），朱祐樘在乾清宫驾崩，在位十八年，享年三十六岁。谥号建天明道诚纯中正圣文神武至仁大德敬皇帝，庙号孝宗，葬于泰陵。 作为守成之君，朱祐樘在“法祖”的旗帜下，对祖制有完善与创新，革除前数朝诸项弊端，全面推行新政。在他的带领下，弘治君臣较好地处理了各种政治问题，营造了“中兴”的局面。因此，历代史家对朱祐樘的评价普遍较高，将其称颂为贤君，比于汉文帝、宋仁宗。"

    character_translate.mingkill_zhuyoucheng = "朱祐樘";
    file_characters.push("mingkill_zhuyoucheng.png");

    skills.mingkill_huizheng = {
        trigger: { player: 'useCardAfter' },
        direct: true,
        frequent: true,
        filter: function (event) {
            return ((get.type(event.card) == 'trick' || get.type(event.card) == 'delay') && event.card.isCard);
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
        forced: true,
        trigger: { player: 'judgeEnd' },
        filter: function (event, player) {
            return get.color(event.result.card) == "red";
        },
        content: function () {
            player.storage.mingkill_renxian_mark.draw();
        }
    }

    skills.mingkill_renxian = {
        trigger: { player: 'phaseJieshuBegin' },
        derivation: ["mingkill_diyou"],
        usable: 1,
        direct: true,
        content: function () {
            'step 0'
            player.chooseTarget(false, "选择一名其他角色，令其获得【恢政】与【帝佑】直至你的下一个回合。", function (card, player, target) {
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
            return event.player.getStat('kill') > 0 && player.hasZhuSkill("mingkill_wuchao");
        },
        check: function (event, player) {
            return get.attitude(player, event.player) > 0;
        },
        content: function () {
            player.line(trigger.player);
            trigger.player.insertPhase();
        }
    }

    skill_translate.mingkill_huizheng = "恢政";
    skill_translate.mingkill_huizheng_info = "当你使用一张普通锦囊牌或延时锦囊牌结算后，你可以进行判定。若结果为：♥：你摸两张牌；♦：你回复 1 点体力。";
    skill_translate.mingkill_renxian = "任贤";
    skill_translate.mingkill_renxian_info = "结束阶段，你可以令一名其他角色获得【恢政】与【帝佑】直至你的下一个回合。";
    skill_translate.mingkill_diyou = "帝佑";
    skill_translate.mingkill_diyou_info = "锁定技。当你的红色判定牌生效后，你令朱祐樘摸一张牌。";
    skill_translate.mingkill_renxian_mark = "任贤";
    skill_translate.mingkill_wuchao = "午朝";
    skill_translate.mingkill_wuchao_info = "主公技。一名角色的结束阶段，如果其于本回合内杀死过角色，则你可以令其执行一个额外的回合。";

    characters.mingkill_zhudi = ["male", "明", 4, ["mingkill_tianzhu", "mingkill_jingnan", "mingkill_junlin"]];
    character_translate.mingkill_zhudi = "朱棣";
    character_intro.mingkill_zhudi = "大明成祖朱棣（1360年5月2日－1424年8月12日），汉族，是明朝第三位皇帝，1402年－1424年在位，年号永乐，故后人称其为永乐帝、永乐大帝、永乐皇帝等。元顺帝至正二十年（1360年）四月十七日（5月2日），朱棣生于应天府（今南京）。早起被封为燕王，洪武三十一年十二月，为了提防朱棣造反，建文帝朱允炆派工部侍郎张昺为北平布政使，都指挥使谢贵、张信为北平都指挥使。随后又命都督宋忠屯兵驻开平，并调走北平原属燕王管辖的军队。后发动靖难之役，起兵攻打建文帝 。1402年在南京登基，改元永乐。 朱棣在位期间改革机构，设贵州承宣布政使司，巩固了南北边防，维护了中国版图的完整。多次派郑和下西洋，加强了中外友好往来。 同时还命人编修《永乐大典》，疏浚大运河。1421年迁都北京，对强化明朝统治起到了非常积极的作用。在位期间将由靖难之后的疮痍局面发展至经济繁荣、国力强盛的盛世，史称“永乐盛世”。 朱棣驾崩后谥号体天弘道高明广运圣武神功纯仁至孝文皇帝，庙号太宗，葬于长陵。嘉靖十七年（1538年）九月，明世宗改谥为启天弘道高明肇运圣武神功纯仁至孝文皇帝，改上庙号为成祖。"

    skills.mingkill_tianzhu = {
        trigger: { global: 'damageBegin1' },
        filter: function (event) {
            return event.card && event.card.name == 'sha' && event.getParent().name == 'sha' &&
                event.player.isIn();
        },
        check: function (event, player) {
            return get.attitude(player, event.source) > 0 && get.attitude(player, event.player) < 0;
        },
        content: function () {
            'step 0'
            player.judge(function (card) {
                if (get.suit(card) == "diamond") return 2;
                else return -2;
            });
            'step 1'
            const suit = get.suit(result.card);
            if (suit == "diamond") trigger.num++;
        }
    }

    skills.mingkill_jingnan = {
        trigger: { player: "phaseJieshuBegin" },
        frequent: true,
        content: function () {
            'step 0'
            player.chooseTarget(false, "选择一名其他角色，令其受到 1 点伤害，然后摸一张牌。", function (card, player, target) {
                if (player == target) return false;
                return true;
            }).set('ai', function (target) {
                var player = _status.event.player;
                return get.damageEffect(target, player, player);
            });
            'step 1'
            if (result.bool) {
                var target = result.targets[0];
                player.line(target);
                target.damage();
                target.draw(1);
            }
            else event.finish();
        }
    }

    skills.mingkill_junlin = {
        zhuSkill: true,
        direct: true,
        trigger: { global: "damageSource" },
        filter: function (event, player) {
            return player != event.player && player.hasZhuSkill("mingkill_junlin");
        },
        check: function (event, player) {
            return get.attitude(player, event.source) > 0;
        },
        content: function () {
            player.draw();
        }
    }

    skill_translate.mingkill_tianzhu = "天助";
    skill_translate.mingkill_tianzhu_info = "当一名角色受到【杀】造成的伤害时，你可以进行判定，若结果为♦，则令此伤害 +1。";
    skill_translate.mingkill_jingnan = "靖难";
    skill_translate.mingkill_jingnan_info = "结束阶段，你可以令一名其他角色受到 1 点伤害，然后其摸一张牌。";
    skill_translate.mingkill_junlin = "君临";
    skill_translate.mingkill_junlin_info = "主公技。当一名其他角色造成伤害后，其可以令你摸一张牌。";

    characters.mingkill_zhuyuanzhang = ["male", "明", 3, ["mingkill_xionglve", "mingkill_baonve", "mingkill_fuyun"]];
    character_translate.mingkill_zhuyuanzhang = "朱元璋";
    character_intro.mingkill_zhuyuanzhang = "朱元璋(1328年10月21日—1398年6月24日)，濠州钟离(今安徽凤阳东北)人，幼名重八，参加农民起义军后改名元璋，字国瑞，元末农民起义军首领，明朝开国皇帝(1368年—1398年在位)，史称明太祖，卓越的军事家、战略家、统帅。朱元璋幼时贫穷，曾为地主放牛。1344年（元至正四年），入皇觉寺，25岁时参加郭子兴领导的红巾军反抗元朝，1356年（至正十六年）被部下诸将奉为吴国公。同年，攻占集庆路，将其改为应天府。1368年（至正二十八年）朱元璋击破各路农民起义军后，在应天府称帝，国号大明，年号洪武。后结束了蒙元在中原的统治，平定四川、广西、甘肃、云南等地，最终统一中国。朱元璋在位期间，下令农民归耕，奖励垦荒；大搞移民屯田和军屯；组织各地农民兴修水利；大力提倡种植桑、麻、棉等经济作物和果木作物、他还徒富民，抑豪强；下令解放奴婢等等。经过洪武时期的努力，社会生产逐渐恢复和发展了，史称洪武之治。1380年（洪武十三年），朱元璋废丞相，设承宣布政使司、提刑按察使司、都指挥使司三司分掌权力，进一步的加强了中央集权。1398年（洪武三十一年），朱元璋病逝于应天，享年71岁，庙号太祖，谥号开天行道肇纪立极大圣至神仁文义武俊德成功高皇帝。葬南京明孝陵。";

    skills.mingkill_xionglve = {
        trigger: { global: 'judge' },
        filter: function (event, player) {
            return player.countCards("hes") > 0;
        },
        direct: true,
        content: function () {
            'step 0'
            var str = get.translation(trigger.player) + '的' + (trigger.judgestr || '') + '判定为' +
                get.translation(trigger.player.judging[0]) + '，是否发动【雄略】，弃置一张牌并修改判定结果？';
            player.chooseControl('spade', 'heart', 'cancel2').set('prompt', str).set('ai', function () {
                var judging = _status.event.judging;
                var trigger = _status.event.getTrigger();
                var res1 = trigger.judge(judging);
                var list = ["spade", "heart"];
                var attitude = get.attitude(player, trigger.player);
                if (attitude == 0) return 0;
                var getj = function (suit) {
                    return trigger.judge({
                        name: get.name(judging),
                        nature: get.nature(judging),
                        suit: suit,
                        number: 8,
                    })
                };
                list.sort(function (a, b) {
                    return (getj(b) - getj(a)) * get.sgn(attitude);
                });
                if ((getj(list[0]) - res1) * attitude > 0) return list[0];
                return 'cancel2';
            }).set('judging', trigger.player.judging[0]);
            "step 1"
            event.suit = result.control;
            if (result.control != 'cancel2') {
                player.discardPlayerCard(player, "hes", true);
            }
            "step 2"
            result.control = event.suit;
            if (result.control != 'cancel2') {
                player.addExpose(0.25);
                player.logSkill('mingkill_xionglve', trigger.player);
                player.popup(result.control);
                game.log(player, '将判定结果改为了', '#y' + get.translation(result.control + 2) + 8);
                trigger.player.judging[0].suit = result.control;
                trigger.player.judging[0].number = 8;
            }
        },
        ai: {
            rejudge: true,
            tag: {
                rejudge: 1,
            },
            expose: 0.5,
        },
    }

    skills.mingkill_baonve = {
        trigger: { player: "shaMiss" },
        usable: 1,
        frequent: true,
        check: () => { return true; },
        content: () => {
            'step 0'
            player.chooseTarget(true, '选择一名角色，视为对其使用一张【杀】')
                .set('ai', function (target) {
                    return get.damageEffect(target, player, player);
                });
            'step 1'
            var new_target = result.targets[0];
            if (new_target.isIn()) {
                player.useCard({ name: 'sha', isCard: true }, new_target, false, 'noai');
            }
        }
    }

    skills.mingkill_fuyun = {
        trigger: { player: 'phaseDrawBegin1' },
        zhuSkill: true,
        filter: function (event, player) {
            return player.hasZhuSkill("mingkill_fuyun");
        },
        check: (event, player) => {
            let drawc = game.countPlayer(function (current) {
                return get.attitude(current, player) >= 0 && current.isIn() && current != player;
            });
            return drawc >= 2;
        },
        content: () => {
            'step 0'
            event.now = player.nextSeat;
            trigger.changeToZero();
            'step 1'
            if (!event.now.isIn()) event.goto(4);
            event.now.chooseBool("是否同意" + get.translation(player) + "摸一张牌？")
                .set('goon', get.attitude(event.now, player) >= 0)
                .set('ai', () => _status.event.goon);
            'step 2'
            const agreement = ["陛下英明！", "这可是利国利民的好事啊！", "陛下英明神武，是臣下的福啊！"];
            const disagreement = ["陛下此言差矣！", "此事断不可为。", "陛下，请多思量一下吧！"];
            const choice = (arr) => {
                return arr[Math.floor(Math.random() * arr.length)];
            }
            if (result.bool) {
                event.now.line(player);
                player.draw();
                event.now.chat(choice(agreement));
                game.log(event.now, "同意" + get.translation(player) + "摸一张牌");
            }
            else {
                game.log(event.now, "拒绝" + get.translation(player) + "摸一张牌");
                event.now.chat(choice(disagreement));
            }
            'step 3'
            game.delay(0.5)
            'step 4'
            event.now = event.now.nextSeat;
            if (event.now != player) event.goto(1);
        }
    }

    skill_translate.mingkill_xionglve = "雄略";
    skill_translate.mingkill_xionglve_info = "当一名角色的判定牌生效前，你可以弃置一张牌，将其改为♠8或♥8。";
    skill_translate.mingkill_baonve = "暴虐";
    skill_translate.mingkill_baonve_info = "每回合限一次，当你使用的【杀】被【闪】抵消后，你可以视为对一名角色使用一张【杀】（无距离限制）。";
    skill_translate.mingkill_fuyun = "辅运";
    skill_translate.mingkill_fuyun_info = "主公技。摸牌阶段，你可以改为令其他角色依次选择是否同意令你摸一张牌。";

    characters.mingkill_zhugaochi = ["male", "明", 4, ["mingkill_renhou", "mingkill_shihuan"]];
    character_translate.mingkill_zhugaochi = "朱高炽";

    skills.mingkill_renhou = {
        trigger: { player: 'damageEnd' },
        frequent: true,
        content: () => {
            for (let i = 0; i < trigger.num; i++) player.draw(player.maxHp - player.hp + 1);
        },
        ai: {
            maixie: true,
            maixie_hp: true,
            effect: {
                target(card, player, target) {
                    if (get.tag(card, 'damage')) {
                        if (player.hasSkillTag('jueqing', false, target)) return [1, -2];
                        if (!target.hasFriend()) return;
                        let num = 1;
                        if (get.attitude(player, target) > 0) {
                            if (player.needsToDiscard()) num = 0.7;
                            else num = 0.5;
                        }
                        if (target.hp >= 4) return [1, num * 2];
                        if (target.hp == 3) return [1, num * 1.5];
                        if (target.hp == 2) return [1, num * 0.5];
                    }
                }
            }
        }
    }

    skills.mingkill_shihuan = {
        usable: 1,
        enable: 'phaseUse',
        filterCard: true,
        zhuSkill: true,
        filterTarget: (card, player, target) => {
            return target.isIn() && target.countCards('j') > 0 && player.hasZhuSkill("mingkill_shihuan");
        },
        filter: () => {
            let drawc = game.countPlayer(function (current) {
                return current.isIn() && current.countCards('j') > 0;
            });
            return drawc > 0;
        },
        check(card) {
            return 9 - get.value(card);
        },
        content: () => {
            let target = event.target;
            player.discardPlayerCard(target, 'j', target.countCards('j'), true);
        },
        ai: {
            order: 9,
            result: {
                target(player, target) {
                    return Math.max(target.countCards('j') * get.attitude(player, target), 0);
                }
            },
        }
    }

    skill_translate.mingkill_renhou = "仁厚";
    skill_translate.mingkill_renhou_info = "当你受到 1 点伤害后，你可以摸 X + 1 张牌（X 为你失去的体力值）。";
    skill_translate.mingkill_shihuan = "释还";
    skill_translate.mingkill_shihuan_info = "主公技。出牌阶段限一次，你可以弃置一张手牌，然后弃置一名角色的判定区内的所有牌。";

    characters.mingkill_zhuzhanji = ["male", "明", 3, ["mingkill_taoluan", "mingkill_chongxi", "mingkill_xumin"]];
    character_translate.mingkill_zhuzhanji = "朱瞻基";

    skills.mingkill_taoluan = {
        trigger: { player: "phaseBegin" },
        frequent: true,
        content: () => {
            'step 0'
            player.chooseTarget(false, "请选择一名角色，令其获得【讨乱】效果。", function (card, player, target) {
                if (player == target) return false;
                return true;
            }).set('ai', function (target) {
                return -get.attitude(_status.event.player, target);
            });
            'step 1'
            if (!result.bool) {
                event.finish();
                return;
            }
            event.target = result.targets[0];
            player.line(event.target);
            player.discardPlayerCard("he", event.target, true);
            'step 2'
            const suit = get.suit(result.cards[0]);
            event.target.storage.mingkill_taoluan_tag = suit;
            event.target.addTempSkill("mingkill_taoluan_tag", { player: "phaseBegin" });
        }
    };

    skills.mingkill_taoluan_tag = {
        onremove: true,
        charlotte: true,
        mark: true,
        intro: { content: '你被当今圣主讨伐，因此你手牌中的非 $ 牌均视为【杀】，点数均视为 A 直至你的下一个回合开始。' },
        mod: {
            cardname: (card, player) => {
                if (get.suit(card, false) != player.storage.mingkill_taoluan_tag) return 'sha';
            },
            cardnature: (card, player) => {
                if (get.suit(card, false) != player.storage.mingkill_taoluan_tag) return false;
            },
            cardnumber: (card, player) => {
                if (get.suit(card, false) != player.storage.mingkill_taoluan_tag) return 1;
            }
        }
    }

    skills.mingkill_chongxi = {
        group: ["mingkill_chongxi_used"],
        enable: "phaseUse",
        usable: 3,
        filter: function (event, player) {
            let count = game.countPlayer((target) => {
                return player.canCompare(target) && player != target && target.mingkill_chongxi_used == undefined;
            });
            return player.countCards('h') > 0 && count > 0;
        },
        init: (player) => {
            player.storage.mingkill_chongxi = 0;
        },
        check: () => { return true },
        content: () => {
            'step 0'
            player.chooseTarget(false, "请选择一名角色，随后对其拼点。\n附注：由于特殊机制原因，对拥有【讨乱】效果的角色拼点时胜负显示可能有误，请以最终获得牌的角色为最终拼点结果。", function (card, player, target) {
                return player.canCompare(target) && player != target && target.mingkill_chongxi_used == undefined;
            }).set('ai', function (target) {
                if (target.storage.mingkill_taoluan_tag) return 114514;
                if (get.attitude(player, target) > 0) return Math.round(Math.round() * 3);
                return Math.round(Math.random() * 10);
            });
            'step 1'
            if (!result.bool) {
                event.finish();
                return;
            }
            event.target = result.targets[0];
            player.line(event.target);
            event.target.mingkill_chongxi_used = true;
            player.chooseToCompare(event.target, function (card) {
                if (card.name == 'du') return 20;
                var player = _status.event.player;
                var target = event.target;
                if (get.attitude(player, target) > 0) {
                    return -get.number(card);
                }
                return get.number(card);
            });
            'step 2'
            var list = [];
            if (get.position(result.player) == 'd') list.push(result.player);
            if (get.position(result.target) == 'd') list.push(result.target);
            if (!list.length) {
                event.finish();
                return;
            }
            event.list = list;
            if (result.bool) {
                player.gain(event.list, "gain2");
                player.storage.mingkill_chongxi++;
                player.markSkill("mingkill_chongxi");
            }
            else {
                event.target.gain(event.list, "gain2");
                player.storage.mingkill_chongxi--;
            }
        },
        mod: {
            maxHandcard: function (player, num) {
                return Math.max(num + player.storage.mingkill_chongxi, 0);
            }
        },
        ai: {
            basic: {
                order: 9
            },
            expose: 0.2,
            threaten: 1.6,
            result: {
                player: function (player) {
                    return 2;
                },
            }
        },
        intro: {
            content: '本回合手牌上限，在原本基础上加上#。'
        }
    }

    skills.mingkill_chongxi_used = {
        trigger: { player: "phaseAfter" },
        firstDo: true,
        silent: true,
        charlotte: true,
        locked: true,
        content: () => {
            event.player = player.nextSeat;
            while (event.player != player) {
                if (event.player.mingkill_chongxi_used != undefined) {
                    delete event.player.mingkill_chongxi_used;
                }
                event.player = event.player.nextSeat;
            }
            player.unmarkSkill("mingkill_chongxi");
            player.storage.mingkill_chongxi = 0;
        }
    }

    skills.mingkill_xumin = {
        zhuSkill: true,
        trigger: { player: "phaseUseEnd" },
        frequent: true,
        fitler: (player) => {
            return player.countCards('h') > 0 && player.hasZhuSkill("mingkill_xumin");
        },
        content: () => {
            'step 0'
            player.chooseTarget([0, player.countCards('h')], "请选择任意名角色", function (card, player, target) {
                return player != target;
            }).set("ai", (target) => {
                if (player.needsToDiscard() && player.countCards('h') < 3) return 0;
                return get.attitude(player, target);
            });
            'step 1'
            event.targets = result.targets
            if (!result.bool) {
                event.finish();
                return;
            }
            event.targets = event.targets.sortBySeat();
            player.chooseToDiscard(result.targets.length).set('ai', function (card) {
                if (card.name == 'tao') return -10;
                if (card.name == 'jiu' && _status.event.player.hp == 1) return -10;
                return get.unuseful(card) + 2.5 * (5 - get.owner(card).hp);
            });
            'step 2'
            if (!result.bool) {
                event.finish();
                return;
            }
            for (var target of event.targets) {
                player.line(target);
                target.draw(2);
            }
        }
    }

    skill_translate.mingkill_taoluan = "讨乱";
    skill_translate.mingkill_taoluan_tag = "讨乱";
    skill_translate.mingkill_taoluan_info = "回合开始时，你可以选择一名角色并弃置其的一张牌，若这样做，此角色与此牌花色不同的手牌均视为【杀】，点数均视为 A 直到其的下一个回合开始。";
    skill_translate.mingkill_chongxi = "虫戏";
    skill_translate.mingkill_chongxi_info = "出牌阶段限三次，你可以选择一名本回合内未选择的其他角色并与其拼点。若你赢，你获得拼点的两张牌，并令本回合你的手牌上限 +1；否则其获得拼点的两张牌，并令本回合你的手牌上限 -1。";
    skill_translate.mingkill_xumin = "恤民";
    skill_translate.mingkill_xumin_info = "主公技。出牌阶段结束时，你可以选择任意名角色并弃置等量的手牌，然后令这些角色依次摸两张牌。";

    return {
        skills: skills,
        characters: characters,
        skill_translate: skill_translate,
        character_translate: character_translate,
        file_characters: file_characters,
        character_intro: character_intro,
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