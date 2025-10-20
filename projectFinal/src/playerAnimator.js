export const playerAnimator = {
    update(player, progress) {
        const { leftArm, rightArm, leftLeg, rightLeg } = player.bodyParts;

        if (!leftArm || !rightArm || !leftLeg || !rightLeg) {
            return;
        }
       
        const angle = Math.sin(progress * Math.PI) * 0.9; 
        const anglelegs = Math.sin(progress * Math.PI) * 0.3;
        
        rightLeg.rotation.x = anglelegs;
        leftArm.rotation.x = angle;
        
        leftLeg.rotation.x = -anglelegs;
        rightArm.rotation.x = -angle;
    },
    
    reset(player) {
        const { leftArm, rightArm, leftLeg, rightLeg } = player.bodyParts;
        
        if (!leftArm || !rightArm || !leftLeg || !rightLeg) {
            return;
        }

        leftArm.rotation.x = 0;
        rightArm.rotation.x = 0;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
    }
};